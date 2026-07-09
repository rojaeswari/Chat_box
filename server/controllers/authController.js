const pool = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const register = async (req, res) => {
  try {
    const { name, email, password,role } = req.body;

    const user = await pool.query(
      "SELECT * FROM users WHERE email=$1",
      [email]
    );

    if (user.rows.length > 0) {
      return res.status(400).json({
        message: "Email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query(
      "INSERT INTO users(name,email,password,role) VALUES($1,$2,$3,$4)",
      [name, email, hashedPassword, role||"user"

        
      ]
    );

    res.status(201).json({
      message: "User Registered Successfully",
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Server Error",
    });
  }
};


// login pages
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("Login Email:", email);

    const user = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );
     console.log("User Found:", user.rows);

    if (user.rows.length === 0) {
      return res.status(400).json({
        message: "Invalid Email",
      });
    }
      console.log("DB Password:", user.rows[0].password);

    const validPassword = await bcrypt.compare(
      password,
      user.rows[0].password
    );

    console.log("Entered Password:", password);
console.log("Password Match:", validPassword);


    if (!validPassword) {
      return res.status(400).json({
        message: "Invalid Password",
      });
    }

    const token = jwt.sign(
      {
        id: user.rows[0].id,
        email: user.rows[0].email,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    res.json({
      message: "Login Successful",
      token,
      user: {
        id: user.rows[0].id,
        name: user.rows[0].name,
        email: user.rows[0].email,
        role: user.rows[0].role,
      },
    });

  } catch (err) {
    console.log(err);

    res.status(500).json({
      message: "Server Error",
    });
  }
};

module.exports = {
  register,
  login,
};

