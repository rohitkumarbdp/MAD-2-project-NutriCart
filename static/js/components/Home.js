import AdminHome from './AdminHome.js';
import ManagerHome from './ManagerHome.js';
import UserHome from './UserHome.js';

const Home = Vue.component("home", {
    template: `
    <div>
        
        <component :is="currentRoleComponent" :email="email" />
    </div>
    `,
    data() {
        return {
            email: localStorage.getItem('email')
        }
    },
    computed: {
        role() {
            return localStorage.getItem('role') || 'unknown';
        },
        currentRoleComponent() {
            switch (this.role) {
                case 'user':
                    return UserHome;
                case 'manager':
                    return ManagerHome;
                case 'admin':
                    return AdminHome;
                default:
                    console.error(`Unknown role: ${this.role}`);  /// Handling unknown roles
                   
                    return UserHome; // Fallback to a default component.
            }
        }
    },
    
});

export default Home;





// import AdminHome from './AdminHome.js';
// import ManagerHome from './ManagerHome.js';
// import UserHome from './UserHome.js';

// const Home = Vue.component("home", {
//     template: `
//     <div>
//     <h4>This is inside Home Page</h4>
//     <UserHome v-if="role=='user'" :email="email"/>
//     <ManagerHome v-if="role=='manager'" />
//     <AdminHome v-if="role=='admin'" />
//     </div>
    
//     `,
//     data(){
//         return{
//             role: localStorage.getItem('role'),
//             email: localStorage.getItem('email')
//         }
//     },
    
    
    
    
//     mounted:function(){
//         document.title = "Home"
//     }
// });


//   export default Home