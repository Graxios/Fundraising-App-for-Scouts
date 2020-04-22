const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const app = require("../app");
const db = require("../db");

// get all scouts connected 
exports.getGroups = (req, res, next) => {
    if (req.userData.leader_flag === 0 &&
        req.userData.admin_flag === 0) 
    {
        return res.status(401).json({
            message: "Authentication Error!"
        });
    }

    // const qry = 'SELECT group_id,group_name,location,group_desc FROM groups Where user_id = ?'; 
    const qry = 'CALL getGroups(?)';
    // console.log(req.userData);
    db.query( qry, [parseInt(req.userData.userId)], (err, rows, fields) => {
        // Catch and DB errors.
        if (err) { 
            console.error(err.code, err.sqlMessage);
            return res.status(401).json({
                message: "Error! Code:" + err.code + " Desc: " + err.sqlMessage
            });
        } 
        // console.log("UserId: "+req.userData.userId+"Groups",rows);
        // return if sucessfully connected to database
        // fetch all data rows from table
        return res.status(200).json({
            rows: rows[0]
        });
    });
}

// get all leaders
exports.getLeaders = (req, res, next) => {
    if (req.userData.admin_flag === 0) {
      return res.status(401).json({
          message: "Authentication Error!"
      });
    }

    // const qry = "SELECT user_id,full_name,email FROM user Where leader_flag = 1 and admin_flag = 0;";
    const qry = 'CALL getLeaders(?)'
    db.query(qry, [parseInt(req.userData.userId)], (err, rows, fields) => {
        // Catch and DB errors.
        if(err) {
            console.error(err.code, err.sqlMessage);
            return res.status(401).json({
             message: "Error! Code:" + err.code + " Desc: " + err.sqlMessage
            });
        };

        // console.log(rows);
        // return if sucessfully connected to database
        // fetch all data rows from table
        return res.status(200).json({
            rows: rows[0]
        });
    });
}

// get all scouts connected 
exports.getScouts = (req, res, next) => {
    if( req.userData.leader_flag === 0 &&
        req.userData.admin_flag === 0) 
    {
        return res.status(401).json({
            message: "Authentication Error!"
        });
    }

    // const qry = "SELECT user_id,full_name,email FROM user WHERE leader_flag = 0 AND admin_flag = 0";
    const qry = "Call getScouts(?)"
    db.query( qry, [parseInt(req.userData.userId)], (err, rows, fields) => {
        // Catch and DB errors.
         if(err) { 
            console.error(err.code, err.sqlMessage);
            return res.status(401).json({
              message: "Error! Code:" + err.code + " Desc: " + err.sqlMessage
            });
        };

        // console.log("Scouts",rows);
       
        // return if sucessfully connected to database
        // fetch all data rows from table
        return res.status(200).json({
            rows: rows[0]
        });
    });
}

exports.getGroup = (req, res, next) => {}
exports.getLeader = (req, res, next) => {}
exports.getScout = (req, res, next) => {}

// insert a new group
exports.addGroup = (req, res, next) => {
    if (req.userData.leader_flag === 0 &&
        req.userData.admin_flag === 0) 
    {
        return res.status(401).json({
            message: "Authentication Error!"
        });
    }

    // console.log(req.body);
    // const qry = 'INSERT INTO groups (`group_id`, `group_name`, `location`, `group_desc`) VALUES (?,?,?,?)';   
    db.query('CALL addGroups(?,?,?,?,?)', 
        [
            req.body.groupId, 
            parseInt(req.userData.userId), 
            req.body.group_name, 
            req.body.location, 
            req.body.group_desc
        ],
        (err, results, fields) => {
        if(err) {
            console.error(err.code, err.sqlMessage);
            return res.status(401).json({
                message: "Error! Code:" + err.code + " Desc: " + err.sqlMessage
            });
        } 

        // console.log("Successfully Added a Group.", results);
        return res.status(200).json({
            rows: results[0]
        });
    }); 
}

// insert new leader
exports.addLeader = (req, res, next) => {
    // console.log(req.userData, req);
    if (req.userData.admin_flag === 0) {
        return res.status(401).json({
            message: "Authentication Error!"
        });
    }

    // const qry = 'INSERT INTO user (`full_name`, `email`, `hash_pass`, `leader_flag`, `admin_flag`, `verified`) VALUES (?, ?, ?, 1, 0, 0)';
    const qry = 'CALL addLeaders(?,?,?,?)';
    const email = req.body.email.toLowerCase();
    const name = req.body.fullname;

    // Hash a password and add the leader // TODO: randomly generate the password initially
    bcrypt
    .hash(req.body.pass, 10)
    .then(hash => {
        pass = hash; 
        db.query(qry, // 'CALL addLeaders(?,?,?)', 
            [
                parseInt(req.userData.userId),
                name, 
                email,
                pass
            ], (err, rows, fields) => {
            if(err) {
                console.error(err.code, err.sqlMessage);
                return res.status(401).json({
                    message: "Error! Code:" + err.code + " Desc: " + err.sqlMessage
                });
            }
            // console.log("Successfully Added a Leader.", rows);
            return res.status(200).json({
                rows: rows[0]
            });
        }); 
    }).catch( error => {
        console.error("HASH: ", error);
    }); 
}

// insert a new scout
exports.addScout = (req, res, next) => {
    if( req.userData.leader_flag === false &&
        req.userData.admin_flag === false) 
    {
        return res.status(401).json({
            message: "Authentication Error!"
        });
    }
    
    const qry = 'INSERT INTO user (`full_name`, `email`, `hash_pass`, `leader_flag`, `admin_flag`, `verified`) VALUES (?, ?, ?, 0, 0, 0)';
    const email = req.body.email.toLowerCase();
    const name = req.body.fullname;
    bcrypt.hash(req.body.pass, 10).then( hash => {
        pass = hash; 
        db.query(qry, [name, email, pass], (err, results, fields) => {
            if(err) {
                console.error(err.code, err.sqlMessage);
                return res.status(401).json({
                    message: "Error! Code:" + err.code + " Desc: " + err.sqlMessage
                });
            } 

            console.log("Successfully Added a Scout.");
            return res.status(201).json({
                message: "Successfully added Scout: " + name 
            });
        }); 
    }).catch( error => {
        console.error("HASH: ", error);
    }); 
}

exports.deleteGroup = (req, res, next) => {
    if (req.userData.leader_flag === 0 &&
        req.userData.admin_flag === 0) 
    {
        return res.status(401).json({
            message: "Authentication Error!"
        });
    }
    // console.log(req.params);
    db.query('CALL deleteGroups(?,?)', 
    [
        parseInt(req.userData.userId),
        req.params.id
    ],
    (err, results, fields) => {
        if(err) {
            console.error(err.code, err.sqlMessage);
            return res.status(401).json({
                message: "Error! Code:" + err.code + " Desc: " + err.sqlMessage
            });
        } 

        // console.log("Successfully Added a Group.", results);
        return res.status(201).json({
            // rows: results[0]
            message: "Success"
        });
    }); 
   
}

exports.deleteLeader = (req, res, next) => {}
exports.deleteScout = (req, res, next) => {}

// update the group
exports.updateGroup = (req, res, next) => {
    if (req.userData.leader_flag === 0 &&
        req.userData.admin_flag === 0) 
    {
        return res.status(401).json({
            message: "Authentication Error!"
        });
    }

    // console.log(req.body, req.params.id);
    // return res.status(201).json({
    //     message: "Back from update group"
    // });

    db.query('CALL updateGroups(?,?,?,?,?,?)', 
    [
        parseInt(req.userData.userId),
        req.params.id,      // prev groupId
        req.body.groupId,   // possibliy new groupId
        req.body.groupName,
        req.body.groupLocation,
        req.body.groupDesc
    ],
    (err, results, fields) => {
        if(err) {
            console.error(err.code, err.sqlMessage);
            return res.status(401).json({
                message: "Error! Code:" + err.code + " Desc: " + err.sqlMessage
            });
        } 

        // console.log("Successfully Updated a Group.", results);
        return res.status(201).json({
            // rows: results[0]
            message: "Success"
        });
    }); 
   
}
