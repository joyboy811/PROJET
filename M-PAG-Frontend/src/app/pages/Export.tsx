import React, { useState } from 'react';
import { Download, FileText, FileSpreadsheet, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { opageApi, campaignsApi, rmmsApi, dimensionsApi, pillarsApi, resultsApi } from '../services/api';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as xlsx from 'xlsx';

export function Export() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const generatePDF = async () => {
    setLoading(true);
    try {
      const doc = new jsPDF();
      doc.setFontSize(22);
      
      if (user?.role === 'responsable_risques') {
        doc.text("Dashboard Report - O-PAGe Risks", 14, 22);
        
        // Fetch dashboard data
        const risksData = await opageApi.risks();
        const rmms = await rmmsApi.list();
        const dimensions = await dimensionsApi.list();
        const pillars = await pillarsApi.list();
        const rmmcResults = await resultsApi.rmmcResults();
        
        const risks = Array.isArray(risksData) ? risksData : (risksData as any).results || [];
        const avgRmmc = rmmcResults.length > 0 
          ? (rmmcResults.reduce((acc, curr) => acc + curr.score, 0) / rmmcResults.length) * 100 
          : 0;

        doc.setFontSize(14);
        doc.text("System Overview:", 14, 35);
        
        doc.setFontSize(11);
        doc.text(`• Active mitigation mechanisms (RMM): ${rmms.length}`, 14, 45);
        doc.text(`• Reference pillars: ${pillars.length}`, 14, 52);
        doc.text(`• Evaluated dimensions: ${dimensions.length}`, 14, 59);
        doc.text(`• Average M-PAGe score (RMMC): ${avgRmmc.toFixed(1)}%`, 14, 66);
        
        doc.setFontSize(14);
        doc.text("Current Risks Detail (from O-PAGe):", 14, 80);

        const tableData = risks.map((r: any) => {
          const score = r.scores && r.scores.length > 0 ? r.scores[r.scores.length - 1] : null;
          return [
            r.name,
            score ? `${(score.score * 100).toFixed(1)}%` : 'Not calculated',
            score ? score.category : '-',
            r.indicators?.length || 0
          ];
        });

        autoTable(doc, {
          startY: 85,
          head: [['Risk Name', 'Fragility Score', 'Category', 'Number of Indicators']],
          body: tableData,
          styles: { font: 'helvetica', fontSize: 10 },
          headStyles: { fillColor: [41, 128, 185] },
          alternateRowStyles: { fillColor: [245, 245, 245] }
        });
        
        doc.save(`Risk_Report_${new Date().getTime()}.pdf`);
      } 
      else {
        // Manager or Auditor
        doc.text("Results Summary - M-PAGe Campaigns", 14, 22);
        
        const campaigns = await campaignsApi.list();
        const rmcResults = await resultsApi.rmcResults();
        const gpmResults = await resultsApi.gpmResults();
        
        doc.setFontSize(14);
        doc.text("Questionnaire and campaign overview:", 14, 35);
        
        doc.setFontSize(11);
        const completed = campaigns.filter(c => c.status === 'completed').length;
        doc.text(`• Total campaigns: ${campaigns.length}`, 14, 45);
        doc.text(`• Completed campaigns: ${completed}`, 14, 52);
        
        doc.setFontSize(14);
        doc.text("Campaign Overview:", 14, 66);

        const campaignTable = campaigns.map((c: any) => {
          const cGpm = gpmResults.find(g => g.campaign === c.id);
          return [
            c.name,
            c.organization,
            c.status === 'completed' ? 'Completed' : 'In Progress',
            `${c.progress.toFixed(0)}%`,
            cGpm ? `${(cGpm.score * 100).toFixed(1)}%` : 'Pending'
          ];
        });

        autoTable(doc, {
          startY: 72,
          head: [['Campaign', 'Organization', 'Status', 'Completion', 'Overall Score (GPM)']],
          body: campaignTable,
          styles: { font: 'helvetica', fontSize: 10 },
          headStyles: { fillColor: [39, 174, 96] },
        });

        doc.save(`Survey_Results_${new Date().getTime()}.pdf`);
      }
    } catch (e) {
      console.error("PDF error:", e);
      alert('Error generating PDF. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const generateExcel = async () => {
    setLoading(true);
    try {
      const wb = xlsx.utils.book_new();

      if (user?.role === 'responsable_risques') {
        const data = await opageApi.risks();
        const rmms = await rmmsApi.list();
        
        const risks = Array.isArray(data) ? data : (data as any).results || [];
        
        // Sheet 1: Risks
        const risksExport = risks.map((r: any) => {
          const score = r.scores && r.scores.length > 0 ? r.scores[r.scores.length - 1] : null;
          return {
            "Risk Name": r.name,
            "Description": r.description,
            "Raw Score (%)": score ? parseFloat((score.score * 100).toFixed(1)) : null,
            "Alert Level": score ? score.category : 'N/A',
            "Number of O-PAGe Indicators": r.indicators?.length || 0
          };
        });
        
        // Sheet 2: Mechanisms
        const rmmExport = rmms.map(m => ({
          "Mechanism Name": m.name,
          "Description": m.description,
          "Configured weights (count)": m.kp_weights.length,
          "Associated Risk": m.associated_risk_name
        }));

        xlsx.utils.book_append_sheet(wb, xlsx.utils.json_to_sheet(risksExport), "Risk Dashboard");
        xlsx.utils.book_append_sheet(wb, xlsx.utils.json_to_sheet(rmmExport), "Mechanisms (RMM)");
        
        xlsx.writeFile(wb, `Export_M-PAGe_Risks_${new Date().getTime()}.xlsx`);
      } 
      else {
        // Manager / Auditor: Campaigns and results
        const campaigns = await campaignsApi.list();
        const rl = await resultsApi.readinessLevels();
        
        // Sheet 1: Campaigns
        const campExport = campaigns.map((c: any) => ({
          "Campaign Name": c.name,
          "Organization": c.organization,
          "Status": c.status,
          "Answered Questions": c.answered_items,
          "Total Progress (%)": c.progress,
          "Start Date": c.launch_date
        }));
        
        // Sheet 2: Readiness Levels (Scores by pillar)
        const rlExport = rl.map(r => ({
          "Campaign ID": r.campaign,
          "M-PAGe Pillar": r.pillar_name,
          "Applied RMM Mechanism": r.rmm || 'Global',
          "Maturity Score (%)": parseFloat((r.score * 100).toFixed(1))
        }));

        xlsx.utils.book_append_sheet(wb, xlsx.utils.json_to_sheet(campExport), "Campaign Tracker");
        xlsx.utils.book_append_sheet(wb, xlsx.utils.json_to_sheet(rlExport), "Questionnaire Scores (RL)");
        
        xlsx.writeFile(wb, `Export_M-PAGe_Results_${new Date().getTime()}.xlsx`);
      }
    } catch (e) {
      console.error("Excel error:", e);
      alert('Error generating Excel. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-gray-900">Built-in Export Module</h1>
        <p className="text-gray-600 mt-2">
          Generate real-time reports (PDF and Excel) based on the full dashboard view:
          <strong className="text-blue-700 ml-1">
            {user?.role === 'responsable_risques' && "O-PAGe summaries, statistics, and RMM mechanisms"}
            {(user?.role === 'responsable_org' || user?.role === 'auditeur') && "Campaign summaries and questionnaire results"}
          </strong>
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 max-w-4xl">
        <button 
          onClick={generatePDF} 
          disabled={loading}
          className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow text-left group disabled:opacity-50"
        >
          <div className="w-12 h-12 rounded-lg bg-red-100 flex items-center justify-center mb-4 group-hover:bg-red-500 transition-colors">
            {loading ? <Loader2 className="w-6 h-6 text-red-600 animate-spin" /> : <FileText className="w-6 h-6 text-red-600 group-hover:text-white transition-colors" />}
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            PDF Summary Report
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Generates a complete structured report listing all metrics from your view (overall scores, totals, and item lists).
          </p>
          <div className="flex items-center gap-2 text-blue-600 font-medium">
            <Download className="w-4 h-4" />
            Download PDF report
          </div>
        </button>

        <button 
          onClick={generateExcel}
          disabled={loading}
          className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow text-left group disabled:opacity-50"
        >
          <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center mb-4 group-hover:bg-green-500 transition-colors">
            {loading ? <Loader2 className="w-6 h-6 text-green-600 animate-spin" /> : <FileSpreadsheet className="w-6 h-6 text-green-600 group-hover:text-white transition-colors" />}
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Analytical Excel workbook (.xlsx)
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Creates an Excel workbook with multiple tabs containing raw reference and results data.
          </p>
          <div className="flex items-center gap-2 text-blue-600 font-medium">
            <Download className="w-4 h-4" />
            Download Excel workbook
          </div>
        </button>
      </div>
    </div>
  );
}
