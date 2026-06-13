import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router';
import { campaignsApi, Campaign } from '../../services/api';
import { Calendar, CheckCircle, Clock, ArrowRight, Download, Upload, Loader2, TrendingUp } from 'lucide-react';

export function CampaignList() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [importingId, setImportingId] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedCampaignId, setSelectedCampaignId] = useState<number | null>(null);

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const data = await campaignsApi.list();
      setCampaigns(data);
    } catch (error) {
      console.error("Error loading campaigns", error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (id: number) => {
    try {
      const blob = await campaignsApi.exportTemplate(id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Template_Campaign_${id}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error exporting template", error);
      alert("Error generating Excel template.");
    }
  };

  const handleImportClick = (id: number) => {
    setSelectedCampaignId(id);
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedCampaignId) return;

    setImportingId(selectedCampaignId);
    try {
      const res = await campaignsApi.importResponses(selectedCampaignId, file);
      alert(`Import successful: ${res.message}`);
      fetchCampaigns(); // Refresh to update progress
    } catch (error: any) {
      console.error("Error importing file", error);
      alert(`Import error: ${error.message || "Please verify the file format."}`);
    } finally {
      setImportingId(null);
      setSelectedCampaignId(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleCreateCampaign = async () => {
    const name = prompt("New campaign name:");
    if (!name) return;
    
    try {
      await campaignsApi.create({ name, organization: "ENSIAS" });
      fetchCampaigns();
    } catch (error) {
      console.error("Error creating campaign", error);
      alert("Error creating campaign.");
    }
  };

  const handleCompute = async (id: number) => {
    try {
      setImportingId(id); // Use importingId as a loading state for compute too
      await campaignsApi.compute(id);
      alert("Calculations complete! You can now view the results.");
      fetchCampaigns();
    } catch (error) {
      console.error("Error computing results", error);
      alert("Error computing results.");
    } finally {
      setImportingId(null);
    }
  };

  const handleDeleteCampaign = async (id: number) => {
    const confirmed = confirm('Are you sure you want to delete this campaign?');
    if (!confirmed) return;

    try {
      await campaignsApi.delete(id);
      alert('Campaign deleted.');
      fetchCampaigns();
    } catch (error) {
      console.error('Error deleting campaign', error);
      alert('Error deleting campaign.');
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-semibold text-gray-900">
              My Evaluation Campaigns
            </h1>
            <p className="text-gray-600 mt-2">
              Manage your institutional capacity assessments
            </p>
          </div>
          <button
            onClick={handleCreateCampaign}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <ArrowRight className="w-4 h-4 rotate-[-90deg]" />
            New Campaign
          </button>
        </div>
      </div>

      <div className="grid gap-6">
        {campaigns.map((campaign) => (
          <div
            key={campaign.id}
            className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {campaign.name}
                </h3>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>
                      Launched on{' '}
                      {new Date(campaign.launch_date || new Date()).toLocaleDateString('en-US')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {campaign.status === 'completed' ? (
                      <>
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-green-600 font-medium">
                          Completed
                        </span>
                      </>
                    ) : (
                      <>
                        <Clock className="w-4 h-4 text-blue-600" />
                        <span className="text-blue-600 font-medium">
                          In progress
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-4">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-gray-600">Progress</span>
                <span className="font-medium text-gray-900">
                  {campaign.progress}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    campaign.status === 'completed'
                      ? 'bg-green-600'
                      : 'bg-blue-600'
                  }`}
                  style={{ width: `${campaign.progress}%` }}
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              {campaign.status === 'completed' ? (
                campaign.progress > 0 ? (
                  <>
                    <Link
                      to={`/campaigns/${campaign.id}/results`}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <CheckCircle className="w-4 h-4" />
                      View Results
                    </Link>
                    <button
                      onClick={() => handleDeleteCampaign(campaign.id)}
                      className="flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-200 text-red-700 rounded-lg hover:bg-red-100 transition-colors"
                    >
                      Delete
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      className="flex items-center gap-2 px-4 py-2 bg-gray-100 border border-gray-200 text-gray-600 rounded-lg"
                      disabled
                    >
                      <Clock className="w-4 h-4" />
                      No Responses
                    </button>
                    <button
                      onClick={() => handleImportClick(campaign.id)}
                      disabled={importingId === campaign.id}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
                    >
                      <Upload className="w-4 h-4" />
                      Import
                    </button>
                    <button
                      onClick={() => handleDeleteCampaign(campaign.id)}
                      className="flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-200 text-red-700 rounded-lg hover:bg-red-100 transition-colors"
                    >
                      Delete
                    </button>
                  </>
                )
              ) : (
                <>
                  <button
                    onClick={() => handleExport(campaign.id)}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Template
                  </button>
                  <button
                    onClick={() => handleImportClick(campaign.id)}
                    disabled={importingId === campaign.id}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <Upload className="w-4 h-4" />
                    Import
                  </button>
                  {campaign.progress > 0 && (
                    <button
                      onClick={() => handleCompute(campaign.id)}
                      disabled={importingId === campaign.id}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      {importingId === campaign.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <TrendingUp className="w-4 h-4" />
                      )}
                      Compute scores
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteCampaign(campaign.id)}
                    className="flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-200 text-red-700 rounded-lg hover:bg-red-100 transition-colors"
                  >
                    Delete
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {/* Hidden file input for Excel/CSV upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".xlsx, .xls, .csv"
        className="hidden"
      />
    </div>
  );
}
