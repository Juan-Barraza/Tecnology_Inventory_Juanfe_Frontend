import api from '@/lib/axios'

import type { ExportXlsxFilter } from '@/types/exports.type'


export const exportApi = {
    exportXlsx: async (filters: ExportXlsxFilter): Promise<Blob> => {
        const res = await api.get('/export/xlsx', {
            params: filters,
            responseType: 'blob',
        })

        return res.data
    }

}