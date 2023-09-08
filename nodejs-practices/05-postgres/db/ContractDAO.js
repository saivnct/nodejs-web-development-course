const pool = require('./db').pool;

/**
 *
 * @param {string} contractAddr
 * @returns {Promise<any>}
 */
GetByContractAddr = async function(contractAddr) {
    if (!pool) {
        throw new Error('Not connected to db');
    }

    const result = await pool.query('SELECT * FROM contracts WHERE contract = $1 LIMIT 1', [contractAddr]);
    if (result.rows.length > 0) {
        return result.rows[0];
    }

    return null;
}

/**
 *
 * @param {string} contractAddr
 * @param {boolean} isVerified
 * @param {Buffer} data
 * @param {string} metadata
 * @returns {Promise<any>}
 */
VerifiedContract = async function(contractAddr, isVerified, data, metadata) {
    if (!pool) {
        throw new Error('Not connected to db');
    }

    if (isVerified && (!data || !metadata) ){
        throw new Error('Invalid params');
    }

    const contract = await GetByContractAddr(contractAddr);

    if (!contract) {
        throw new Error('Contract not found');
    }

    let result;
    if (!isVerified){
        result = await pool.query('UPDATE contracts SET ' +
            '"verified" = $2, ' +
            '"metadata"= $3 ' +
            'WHERE contract = $1',
            [contractAddr, false, ""]);
    }else{
        if (contract.data.toString('hex') !== data.toString('hex')){
            console.log("Verified with Update data")
            result = await pool.query('UPDATE contracts SET ' +
                '"data" = $2, ' +
                '"verified" = $3, ' +
                '"metadata"= $4 ' +
                'WHERE contract = $1',
                [contractAddr, data, true, metadata]);
        }else{
            result = await pool.query('UPDATE contracts SET ' +
                '"verified" = $2, ' +
                '"metadata"= $3 ' +
                'WHERE contract = $1',
                [contractAddr, true, metadata]);
        }
    }

    return result;
}


module.exports = {
    GetByContractAddr,
    VerifiedContract,
}
