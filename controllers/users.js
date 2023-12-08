const {request, response} = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const usersModel = require('../models/users');
const pool = require('../db');
//1//
const listUsers = async(req = request, res = response)  => {
let conn;
try {
    conn = await pool.getConnection();

    const users = await conn.query(usersModel.getAll, (err) => {
        if (err) {
            throw err;
            
        }
    })    
    res.json(users)
} 
catch (error) {
    console.log(error);
    res.status(500).json(error);

} finally{
    if(conn)
    {conn.end();}
}
}
//2//
const listUserByID = async(req = request, res = response)  => {
    const {id}=req.params;
    let conn; 

    if (isNaN(id)) {   //cuando no es un número//
        res.status(400).json({msg: `THE ID - IS INVALID`});    //mostrata este mensaje cuando se tecleé un carácter en vez de un munero// 
        return;
        
    }
    
    try {
        conn = await pool.getConnection();
    
        const [user] = await conn.query(usersModel.getByID, [id], (err) => {    //consulta de los registro en nuestra base de datos//
            if (err) {
                throw err;
                
            }
        })

        if (!user) {
            res.status(404).json({msg: `USER WITH ID ${id} NOT FOUND`});     //mostrata este mensaje cuando se tecleé un numero en vez de un carácter// 
            return;
        }

        res.json(user);
    } catch (error) {
        console.log(error);
        res.status(500).json(error);
    
    } finally{
        if(conn)
        {conn.end();}
    }
    }

    //AÑADE UN NUEVO USUARIO O REGISTRO//



    const addUser=async(req = request, res = response) => {
        const {
            username,
            password,
            email,
            name,
            lastname,
            phonenumber= '',
            role_id,
            is_active= 1
        } = req.body;

        if (!username || !password || !email || !name || !lastname || !role_id) {
            res.status(400).json({msg: 'MISSING INFORMATION'});
            return;
        }
        const salRounds = 10;
        const passwordHash = await bcrypt.hash(password, salRounds);

        const user = [
            username, 
            passwordHash, 
            email, 
            name, 
            lastname, 
            phonenumber, 
            role_id, 
            is_active]
        let conn;

        try {
            conn = await pool.getConnection();

            const [usernameExists] = await conn.query(usersModel.getByUsername, [username], (err) => {
                if (err) throw err;
                })
                if (usernameExists) {
                    res.status(409).json({msg: 'Username ${username} already exists'});
                    return;
                }

            const [emailExists] = await conn.query(usersModel.getByEmail, [email], (err) => {
                if (err) throw err;
                })
                if (emailExists) {
                    res.status(409).json({msg: 'Email ${email} already exists'});
                    return;
                    }



            const userAdded = await conn.query(usersModel.addRow, [...user], (err) => {
                if (err) throw err;
                })
                if (userAdded.affecteRows === 0){
                    throw new Error('User not added')
                }                                                   
                res.json({msg: 'USER ADDED SECCESFULLY'});        
        } catch (error) {
            console.log(error);
            res.status(500).json(error);
            return;
        }finally{
            
            if(conn)conn.end();
            
        }
        }

        //Nuevo EndPoint 4 Modificar o Actualizar un registro ya registrado en nuestra base de datos//
        const updateUser = async (req = request, res = response) => {
            let conn;
        
            const {
                username,
                password,
                email,
                name,
                lastname,
                phonenumber,
                role_id,
                is_active
            } = req.body;

            const { id } = req.params;

            if (isNaN(id)) {   //cuando no es un número//
                res.status(400).json({msg: `THE ID - IS INVALID`});    //mostrata este mensaje cuando se tecleé un carácter en vez de un munero// 
                return;
                
            }

            let passwordHash;
            if (password) {
                const salRounds = 10;
                passwordHash = await bcrypt.hash(password, salRounds);
                
            }

            let userNewData = [
                username,
                passwordHash,
                email,
                name,
                lastname,
                phonenumber,
                role_id,
                is_active
            ];
        
            try {
                conn = await pool.getConnection();
        
        const [userExists] = await conn.query
        (usersModel.getByID, 
            [id], 
            (err) => {
            if (err) throw err;
        });

        if (!userExists || userExists.is_active ===0){
            res.status(409).json({msg: `User with ID ${id} not found`});
                return;
        }

        const [usernameExists] = await conn.query(usersModel.getByUsername, [username], (err) => {
            if (err) throw err;
            })
            if (usernameExists) {
                res.status(409).json({msg: 'Username ${username} already exists'});
                return;
            }

        const [emailExists] = await conn.query(usersModel.getByEmail, [email], (err) => {
            if (err) throw err;
            })
            if (emailExists) {
                res.status(409).json({msg: 'Email ${email} already exists'});
                return;
                }

                const userOldData = [
                userExists.username,
                userExists.password,
                userExists.email,
                userExists.name,
                userExists.lastname,
                userExists.phonenumber,
                userExists.role_id,
                userExists.is_active     
            ];

            userNewData.forEach((userData, index) =>{
                if (!userData){
                    userNewData[index] = userOldData[index];
                }
            })
                const userUpdated = await conn.query(
                    usersModel.updateRow,
                    [...userNewData, id],
                    (err) =>{
                        if (err) throw err;
                    }
                )

        if (userUpdated.affecteRows === 0){
        throw new Error('User not added')
                } 

                res.json({msg: 'USER UPDATED SECCESFULLY'});
                
            } catch (error) {
                console.log(error);
                res.status(500).json(error);
                return;
            } finally {
                if (conn) conn.end();
            }
        }
        
    


//endpoint 5//para eleminar  un usuario
        const deleteUser = async(req = request, res = response) => {
            let conn;
            const {id} = req.params; 
            if (isNaN(id)) {   //cuando no es un número//
                res.status(400).json({msg: `THE ID - IS INVALID`});    //mostrata este mensaje cuando se tecleé un carácter en vez de un munero// 
                return;
                
            }


        try {

            conn = await pool.getConnection();

            const [userExists] = await conn.query
            (usersModel.getByID, 
                [id], 
                (err) => {
                if (err) throw err;
            });

            if (!userExists || userExists.is_active ===0){
                res.status(409).json({msg: `User with ID ${id} not found`});
                return;

            }

            const userDeleted = await conn.query(
                usersModel.deleteRow,
                [id],
                (err) => {
                    if (err) throw err;
                }
            );
            
            if (userDeleted.affecteRows === 0){
                throw new Error('User not deleted');

            }
            res.json ({msg: 'User deleted seccesfully'});

        } catch (error) {
            console.log(error);
            res.status(500).json(error);
        } finally{
            if(conn) (await conn).end();


        }
            
}  

const signInUser = async (req = request, res = response) => {
    let conn;

    const {username, password} = req.body;


    try{

        conn = await pool.getConnection

        if (!username || !password){
            res.status(400).json({msg: 'You must send Username and Password'});
            return;
        }
    
        const [user] = conn.query(
        usersModel.getByUsername,
        [username], 
        (err)=> {
            if (err) throw err;
            }
        );
    
        if(!user){
            res.status(404).json({msg: `wrong username or password`});
            return;
        }
    
        const passwordOk = await bcrypt.compare(password, user.password);
    
        if (!passwordOk) {
            res.status(404).json({msg: `wrong username or password`});
            return;
        }

        delete(user.password);
        delete(user.created_at);
        delete(user.updated_at);

        res.json(user);
    } catch (error) {
        console.log(error) 
        res.status(500).json(error);
        } finally {
            if (conn) conn.end(error);
        }
        
    }


    //JWT
    
        const token = jwt.sign({
            id: user.id,
            username: user.username,
            role_id: user.role_id
        },
        process.env.JWT_SECRET_KEY,
        {expiresIn: '5m'}
        );

        res.json({user, token});

    }catch(error){
        console.log(error);
        res.status(500).json(error);
    }finally{
        if (conn) conn.end();
        }
    }

    //endpoint para validar el Token
    const verifyToken = async (token, role ) => {
    let conn;

    try{
        conn = await pool.getConnection();
        const decoded = jwt.verify(req.body.token, process.env.JWT_SECRET_KEY);

        const [user]= await conn.query
        usersModel.getByID,
        [decoded.id],
        (err)=> {
            if(err)throw err;
        }

    if(!user){
        return{ok:false, msg:'user not found'};
    }

    const now =new Date().getTime();
    const tokenExpiration = new Date(decoded.exp = 1000);

    if (now > tokenExpiration){
        return{ok: false, msg:'Token expired'};
    }

    if (user.role_id !== role){
        return{ok: false, msg:'invalid role'};
    }

    const token = jwt.sign({
        id: user.id,
        username: user.username,
        role_id: user.role_id
    },
    process.env.JWT_SECRET_KEY,
    {expiresIn: '5m'}
    );

    return{ok: true, token};   
    } catch (error){
        console.log(error);
        return{ok: false, msg: 'Invalid token', error};
    }
    }

        
    module.exports = {listUsers, listUserByID, addUser, updateUser, deleteUser, signInUser, verifyToken}
