import { closeClientPool } from "../config/poolManager.js";

const updateCampaignStatuses = async (clientPool, clientId) => {
    let query = 'SELECT  * FROM sm_inventory_campaign_management WHERE status = "active" OR status = "scheduled"';

    try {
        const [rows] = await clientPool.query(query);
        if (rows.length > 0) {
            let activeRows =  rows.filter(row => row.status === 'active');
            let scheduledRows = rows.filter(row => row.status === 'scheduled');
            const currentDate = new Date();

            let campaignsStatusChanged = {activated: [], completed: []}
            campaignsStatusChanged.completed = await handleActiveRows(activeRows, clientPool, campaignsStatusChanged);

            for (const row of scheduledRows) {
                const startDate = new Date(row.start_date);
                if (currentDate >= startDate) {
                    // Update status to 'active'
                    const updateQuery = 'UPDATE sm_inventory_campaign_management SET status = "active" WHERE campaign_id = ?';
                    await clientPool.query(updateQuery, [row.campaign_id]);
                    console.log(`Campaign ID ${row.campaign_id} status updated to 'active'`);
                    campaignsStatusChanged.activated.push(row.campaign_id);
                }
            }
            return campaignsStatusChanged;
        }
    }
    catch (error) {
        console.error(`Error fetching campaigns for client ${clientId}:`, error);
        throw error;
    }
    finally {
        closeClientPool(clientId);
    }
}


const handleActiveRows = async (activeRows, clientPool) => {
    for (const row of activeRows) {
        // Implement logic for active rows
        console.log(`Handling active campaign ID: ${row.campaign_id}`);
        const query = "SELECT * from sm_reporting_campaign_summery where campaign_id = ? ORDER BY last_updated_impression DESC LIMIT 1";
        const [reportRows] = await clientPool.query(query, [row.campaign_id]);
        if (reportRows.length > 0) {
            const report = reportRows[0];
            // Example logic: If impressions exceed a threshold, deactivate the campaign
            const latestReportDate = new Date(report.last_updated_impression).getDate();
            if (latestReportDate < new Date(row.end_date).getDate()) {
                console.log(`Campaign ID ${row.campaign_id} is still within the end date.`);
            } else {
                const updateQuery = 'UPDATE sm_inventory_campaign_management SET status = "completed" WHERE campaign_id = ?';
                await clientPool.query(updateQuery, [row.campaign_id]);
                console.log(`Campaign ID ${row.campaign_id} has reached its end date. Status updated to 'completed'`);
            }
           
        }

    }

}


export default updateCampaignStatuses;



