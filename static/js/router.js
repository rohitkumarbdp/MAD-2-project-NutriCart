import Home from "./components/Home.js"
import Login from "./components/Login.js";
import RegistrationForm from "./components/RegistrationForm.js";
import AdminHome from "./components/AdminHome.js";
import ActivateManagers from "./components/ActivateManagers.js";
import DismissManagers from "./components/DismissManagers.js";
import SeeProducts from "./components/SeeProducts.js"; 
import EditProduct from "./components/EditProduct.js";
import AddProduct from "./components/AddProduct.js";
import RequestEditCategory from "./components/RequestEditCategory.js";
import Inbox from "./components/Inbox.js";
import requestAddCategory from "./components/RequestAddCategory.js";
import UserProductsPage from "./components/UserProductsPage.js";
import UserCart from "./components/UserCart.js";
import PaymentPage from "./components/PaymentPage.js";
import ReportFile from "./components/ReportFile.js";
import SearchBar from "./components/SearchBart.js";


const router = new VueRouter({
    routes:[
        {path: '/', component :Home, name : 'Home'},
        {path: '/login', component : Login, name: 'Login'},
        {path:'/register', component:RegistrationForm, name:'registration'},
        {path:'/admin-home',component:AdminHome, name: 'AdminHome'},
        {path: '/activate-managers', component:ActivateManagers},
        {path: '/dismiss-managers', component:DismissManagers},
        { path:'/category/product/:id/:cat',component:SeeProducts, name:"SeeProducts" },
        { path:'/edit-product/:id',component:EditProduct, name:'EditProduct' },
        { path:'/add-product/:id/:cat',component:AddProduct, name:"AddProduct"},
        {path:'/request-edit-category/:id',component:RequestEditCategory },
        {path:'/inbox',component:Inbox, name:'Inbox' },
        {path:'/request-add-category',component:requestAddCategory, name:'requestAddCategory' },
        { path:'/products/:id/:userEmail/:cat',component:UserProductsPage, name:'UserProductsPage'},
        { path:'/see-cart/:userEmail',component:UserCart,name:'UserCart'},
        { path:'/payment-page/:userEmail',component:PaymentPage , name:'PaymentPage'},
        {path:'/see-report',component:ReportFile },
        {path: '/search/:term',component:SearchBar, name:'SearchBar'},
    ]
})
export default router;