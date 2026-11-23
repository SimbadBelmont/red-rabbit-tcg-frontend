// Reduce una foto antes de subirla (lado mayor ≤ 900 px, JPEG): una foto de celular de 4 MB queda en ~100 KB.
export async function reducirImagen(archivo, ladoMax = 900, calidad = 0.85) {
    const bitmap = await createImageBitmap(archivo);
    const escala = Math.min(1, ladoMax / Math.max(bitmap.width, bitmap.height));
    const lienzo = document.createElement('canvas');
    lienzo.width = Math.round(bitmap.width * escala);
    lienzo.height = Math.round(bitmap.height * escala);
    lienzo.getContext('2d').drawImage(bitmap, 0, 0, lienzo.width, lienzo.height);
    bitmap.close?.();
    const blob = await new Promise((ok) => lienzo.toBlob(ok, 'image/jpeg', calidad));
    return new File([blob], 'foto.jpg', { type: 'image/jpeg' });
}
