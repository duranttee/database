const usersModel = {
    getAll: `
    SELECT 
    *
    FROM    
        users_1
    ` ,


    getByID: `
    SELECT
        *
    FROM
        users_1
    WHERE
        id = ?
    `,

}

module.exports = usersModel;

