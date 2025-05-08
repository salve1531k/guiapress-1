const express = require("express");
const router = express.Router();
const Category = require("../categories/Category");
const Article = require("./Articles");
const slugify = require("slugify");

// Listar todos os artigos
router.get("/admin/articles", (req, res) => {
    Article.findAll({
        include: [{model: Category}]
    }).then(articles => {
        res.render("admin/articles/index", { articles });
    }).catch(err => {
        console.error("Erro ao buscar artigos:", err);
        res.redirect("/");
    });
});

// Formulário para criar novo artigo
router.get("/admin/articles/new", (req, res) => {
    Category.findAll().then(categories => {
        res.render("admin/articles/new", { categories });
    }).catch(err => {
        console.error("Erro ao carregar categorias:", err);
        res.redirect("/admin/articles");
    });
});

// Salvar artigo no banco
router.post("/articles/save", (req, res) => {
    const { title, body, category } = req.body;

    console.log("Dados recebidos:", title, body, category); // depuração

    if (title && body && category) {
        Article.create({
            title: title,
            slug: slugify(title),
            body: body,
            categoryId: category
        }).then(() => {
            res.redirect("/admin/articles");
        }).catch(err => {
            console.error("Erro ao salvar artigo:", err);
            res.redirect("/admin/articles/new");
        });
    } else {
        res.redirect("/admin/articles/new");
    }
});


// Rota para deletar uma categoria
router.post("/articles/delete", (req, res) => {
    var id = req.body.id;

    if (id != undefined && !isNaN(id)) {
        Article.destroy({
            where: { id: id }
        }).then(() => {
            console.log("Artigo deletad0, ID:", id);
            res.redirect("/admin/articles");
        }).catch(err => {
            console.error("Erro ao deletar artigo:", err);
            res.redirect("/admin/articles");
        });
    } else {
        res.redirect("/admin/articles");
    }
});

module.exports = router;
