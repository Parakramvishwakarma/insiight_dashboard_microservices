import insiightPool from './config/insiightCommonPool.js';


const getInsiightClientNames = async () => {
    let query = 'SELECT client_id, db_name, client_name FROM sm_clients_info';
    try {
        const [rows] = await insiightPool.query(query);
        return rows;
    }
    catch (error) {
        console.error('Error fetching client names:', error);
        throw error;
    }
    finally {
        await insiightPool.end();
    }
};



const main = async () => {
    try {
        const clients = await getInsiightClientNames();
        console.log('Insiight Clients:', clients);
    } catch (error) {
        console.error('Error in main execution:', error);
    }
};

main();