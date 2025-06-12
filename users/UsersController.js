const express = require("express");
const router = express.Router();
const User = require("./Users");
const bcrypt = require("bcryptjs");

// Listar usuários
router.get("/admin/users", (req, res) => {
    User.findAll().then(users => {
        res.render("admin/users/index", { users });
    });
});

// Formulário de criação de usuário
router.get("/admin/users/create", (req, res) => {
    res.render("admin/users/create");
});

// Salvar novo usuário
router.post("/users/create", (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.redirect("/admin/users/create");
    }

    User.findOne({ where: { email } }).then(user => {
        if (!user) {
            const salt = bcrypt.genSaltSync(10);
            const hash = bcrypt.hashSync(password, salt);

            User.create({
                email: email,
                password: hash
            }).then(() => {
                res.redirect("/admin/users");
            }).catch((err) => {
                console.error("Erro ao criar usuário:", err);
                res.redirect("/admin/users/create");
            });
        } else {
            res.redirect("/admin/users/create");
        }
    }).catch(err => {
        console.error("Erro ao buscar usuário:", err);
        res.redirect("/admin/users/create");
    });
});

// Página de login
router.get("/login", (req, res) => {
    res.render("login");
});

// Autenticação do login
router.post("/login", (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.redirect("/login");
    }

    User.findOne({ where: { email } }).then(user => {
        if (user) {
            const correct = bcrypt.compareSync(password, user.password);
            if (correct) {
                req.session.user = {
                    id: user.id,
                    email: user.email
                };
                res.redirect("/");
            } else {
                res.redirect("/login");
            }
        } else {
            res.redirect("/login");
        }
    }).catch(err => {
        console.error("Erro ao autenticar usuário:", err);
        res.redirect("/login");
    });
});

// Logout
router.get("/logout", (req, res) => {
    req.session.user = undefined;
    res.redirect("/");
});

module.exports = router;