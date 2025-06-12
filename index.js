const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const connection = require("./database/database");
const session = require("express-session");

const categoriesController = require("./categories/CategoriesController");
const articlesController = require("./articles/ArticlesController");
const usersController = require("./users/UsersController");

const Article = require("./articles/Articles");
const Category = require("./categories/Category");
const User = require("./users/Users");

// View engine
app.set('view engine', 'ejs');

// Sessions
app.use(session({
    secret: "textoaleatorio",
    cookie: { maxAge: 30000 }
}));

// ✅ Torna o usuário logado disponível nas views EJS
app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    next();
});

// Static files
app.use(express.static('public'));

// Body parser
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// ✅ Middleware para carregar categorias nas views
app.use((req, res, next) => {
    Category.findAll()
        .then(categories => {
            res.locals.categories = categories;
            next();
        })
        .catch(err => {
            console.error("Erro ao carregar categorias no middleware:", err);
            res.locals.categories = [];
            next();
        });
});

// Database
connection
    .authenticate()
    .then(() => {
        console.log('conexão feita com sucesso');
    }).catch((error) => {
        console.log(error);
    });

// Controllers
app.use("/", categoriesController);
app.use("/", articlesController);
app.use("/", usersController);

app.get("/", (req,res) => {
    Article.findAll({
        order: [['id', 'DESC']],
        include: [{ model: Category }]
    }).then(articles => {
        res.render("index", {articles: articles});
    })
})

// Filtro por categoria
app.get("/category/:slug", (req, res) => {
    const slug = req.params.slug;
    Category.findOne({
        where: { slug },
        include: [{ model: Article }]
    }).then(category => {
        if (category) {
            // Ordena os artigos por id desc
            const articles = (category.articles || []).sort((a, b) => b.id - a.id);
            res.render("index", { articles });
        } else {
            res.redirect("/");
        }
    }).catch(err => {
        res.redirect("/");
    });
})

// Página de login
app.get("/login", (req, res) => {
    res.render("login");
});

app.listen(4000, () => {
    console.log("O servidor está rodando na porta 4000");
});
