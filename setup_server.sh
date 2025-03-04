#!/bin/bash

# Actualiza repos e instala actualizaciones
echo "🔧 Actualizando servidor..."
sudo apt update && sudo apt upgrade -y

# Instalar paquetes base
echo "📦 Instalando paquetes base (wget, git)..."
sudo apt install wget git -y

# Instalar Apache
echo "🌐 Instalando Apache..."
sudo apt install apache2 -y

# Verifica si snapd está instalado, si no lo instala
if ! command -v snap &> /dev/null; then
    echo "📦 snapd no encontrado, instalando..."
    sudo apt install snapd -y
    sudo systemctl enable --now snapd
else
    echo "✅ snapd ya está instalado."
fi

# Enlaza snapd para que funcione bien
sudo ln -s /var/lib/snapd/snap /snap

# Instalar Certbot desde Snap
echo "🔐 Instalando Certbot desde Snap..."
sudo snap install core; sudo snap refresh core
sudo snap install --classic certbot

# Crear alias para que certbot funcione directo
sudo ln -s /snap/bin/certbot /usr/bin/certbot

# Verifica instalación de Certbot
certbot --version

echo "✅ Servidor actualizado, Apache, wget, git y Certbot instalados."
