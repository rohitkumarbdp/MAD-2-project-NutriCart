import router from "./router.js"
import Navbar from "./components/Navbar.js";


  router.beforeEach((to, from, next) => {
    const authToken = localStorage.getItem('auth-token');
    if (to.name !== 'Login' && !authToken) {
      if (to.name === 'registration') {
        next();
      } else {
        next({ name: 'Login' });
      }
    } else {
      next();
    }
  });

new Vue({
    el: '#app',
    template: `<div>
    <Navbar :key="$route.path" />
    <router-view></router-view>
    </div>
    `,
    router,
    components: {
        Navbar,
        
      },
      
    
})