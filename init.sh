#!/bin/bash
# Script d'initialisation pour PAGe Platform après docker compose up

echo "🔧 Initialisation de PAGe Platform..."

# Attendre que les services soient prêts
echo "⏳ Attente des services..."
sleep 10

# O-PAGe
echo "📊 Initialisation O-PAGe..."
docker exec opage-backend python manage.py migrate
echo "✅ O-PAGe migrations complétées"

# M-PAGe
echo "📋 Initialisation M-PAGe..."
docker exec mpage-backend python manage.py migrate
echo "✅ M-PAGe migrations complétées"

echo ""
echo "🎉 Initialisation complète !"
echo ""
echo "📱 Accédez aux services :"
echo "   • O-PAGe:     http://localhost:3000"
echo "   • M-PAGe:     http://localhost:5173"
echo "   • I-PAGe:     http://localhost:3002"
echo ""
