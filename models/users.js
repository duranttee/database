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

    getByUsername: `
    SELECT
        *
    FROM
        users_1
    WHERE
        username = ?
    `,

    getByEmail: `
    SELECT
        *
    FROM
        users_1
    WHERE
        email = ?
    `,

    addRow: `
        INSERT INTO
            users_1 (
                username, 
                password
                email,
                name,
                lastname,
                phone_number,
                role_id,
                is_active, 
            )VALUES(
                ?, ?, ?, ?, ?, ?, ?, ?
                )
                

            )
    `

}

module.exports = usersModel;

