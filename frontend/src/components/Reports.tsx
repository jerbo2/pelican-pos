import { Box, Fade } from "@mui/material";
import { useEffect, useState } from "react";
import axios from "axios";
import { DataGrid } from "@mui/x-data-grid";
import BaseNav from "./BaseComps/BaseNav";

interface TransactionTotals {
    id: number;
    date: string;
    total_sales: string;
    total_taxable: string;
    total_non_taxable: string;
    total_tax: string;
    total_cash: string;
    total_card: string;
}

const columns = [
    { field: 'id', headerName: 'ID', flex: 0.5 },
    { field: 'date', headerName: 'Date', flex: 1.3 },
    { field: 'total_sales', headerName: 'Total Sales', flex: 1 },
    { field: 'total_taxable', headerName: 'Total Taxable', flex: 1 },
    { field: 'total_non_taxable', headerName: 'Total Non-Taxable', flex: 1 },
    { field: 'total_tax', headerName: 'Total Tax', flex: 1 },
    { field: 'total_cash', headerName: 'Total Cash', flex: 0.7 },
    { field: 'total_card', headerName: 'Total Card', flex: 0.7 },
];

export default function Reports() {
    const [reports, setReports] = useState<TransactionTotals[]>([]);

    useEffect(() => {
        getReports();
    }, []);

    const getReports = async () => {
        if (reports.length > 0) return;
        try {
            const res = await axios.get(`/api/v1/reports/`);
            setReports(res.data);
        }
        catch (error) {
            console.error(error);
        }
    }

    return (
        <Box sx={{ height: '100vh', width: '100vw' }}>
            <BaseNav renderItems={false} pageName="REPORTS" pageRoot="/reports" />
            <Fade in={reports.length > 0}>
                <div style={{margin: '8px'}}>
                    <DataGrid columns={columns} rows={reports} autoHeight />
                </div>
            </Fade>
        </Box>
    )
}