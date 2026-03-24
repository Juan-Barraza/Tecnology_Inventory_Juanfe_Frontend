import { useMutation } from '@tanstack/react-query'
import type { ExportXlsxFilter } from '@/types/exports.type';
import { exportApi } from '@/api/export.api';



export function useExportXlsx() {
    return useMutation({
        mutationFn: async (filters: ExportXlsxFilter) => {
            const blob = await exportApi.exportXlsx(filters);

            // 1. Crear una URL para el Blob
            const url = window.URL.createObjectURL(blob);

            // 2. Crear un elemento <a> invisible
            const link = document.createElement('a');
            link.href = url;

            // 3. Definir el nombre del archivo
            // Si no quieres extraerlo del header, puedes poner uno por defecto:
            link.setAttribute('download', `inventario_${new Date().toISOString().split('T')[0]}.xlsx`);

            // 4. Simular el clic y limpiar
            document.body.appendChild(link);
            link.click();
            link.parentNode?.removeChild(link);
            window.URL.revokeObjectURL(url);
        },
        onError: (error) => {
            console.error("Error descargando el archivo", error);
        }
    });
}