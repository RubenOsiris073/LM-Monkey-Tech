#!/bin/bash

# Actualiza repos e instala actualizaciones
echo "🔧 Actualizando servidor..."
sudo apt update && sudo apt upgrade -y

# Instalar paquetes base
echo "📦 Instalando paquetes base (wget, git, unzip)..."
sudo apt install wget git unzip -y

# Instalar Apache
echo "🌐 Instalando Apache..."
sudo apt install apache2 -y

# Habilitar y arrancar Apache
echo "🚀 Habilitando y arrancando Apache..."
sudo systemctl enable apache2
sudo systemctl start apache2

# Verificar estado de Apache
if systemctl is-active --quiet apache2; then
    echo "✅ Apache está corriendo correctamente."
else
    echo "❌ Hubo un problema iniciando Apache."
    exit 1
fi

# Descargar archivo zip
echo "📥 Descargando plantilla..."
wget -O plantilla.zip "https://plantillashtmlgratis.com/wp-content/themes/helium-child/vista_previa/css/codepenio-logo/codepenio-logo.zip"

# Verificar si la descarga fue exitosa
if [ -f "plantilla.zip" ]; then
    echo "✅ Descarga completada."
else
    echo "❌ Error en la descarga."
    exit 1
fi

# Extraer archivos
echo "📂 Extrayendo archivos..."
unzip plantilla.zip -d plantilla

# Mover index.html y styles.css desde codepenio-logo a /var/www/html/
echo "📁 Moviendo archivos a /var/www/html/..."
sudo mv plantilla/codepenio-logo/index.html /var/www/html/
sudo mv plantilla/codepenio-logo/styles.css /var/www/html/

# Cambiar permisos y propietario para Apache
echo "🔧 Ajustando permisos..."
sudo chown www-data:www-data /var/www/html/index.html /var/www/html/styles.css
sudo chmod 644 /var/www/html/index.html /var/www/html/styles.css

# Reiniciar Apache
echo "🔄 Reiniciando Apache..."
sudo systemctl restart apache2

echo "✅ Instalación completada. Revisa tu servidor web."
