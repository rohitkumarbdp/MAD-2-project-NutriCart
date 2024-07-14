const Login = Vue.component('login', {
    template : 
    `
    <div>
    <div class="d-flex justify-content-center mt-5">
      <div class="mb-3 p-5 bg-dark-subtle">
        
        <div class="mb-3">
          <label for="user-email" class="form-label" style="color: brown;"><strong>Email address</strong></label>
          <input type="email" class="form-control" id="user-email" placeholder="name@example.com" v-model="cred.email">
        </div>
        <div class="mb-3">
          <label for="user-password" class="form-label" style="color: brown;"><strong>Password</strong></label>
          <input type="password" class="form-control" id="user-password" v-model="cred.password">
        </div>
        <div class="text-danger">{{ error }}</div>
        <button class="btn btn-primary mt-2" @click="login" style="background-color:brown;border-color: brown;">Login</button>
      </div>
    </div>
  
  
  </div>
  
    `,
    data(){
        return{
            cred:{
                email:null,
                password: null,
            },
            error:null
        }
    },
    computed:{
    },

    methods:{
        async login() {
            try {
              const res = await fetch('/user-login', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(this.cred),
              });
          
              if (res.ok) {
                const data = await res.json();
                const { token, role, email, first_name } = data;
                if (token && role && email) {
                  localStorage.setItem('auth-token', token);
                  localStorage.setItem('role', role);
                  localStorage.setItem('email', email);
                  localStorage.setItem('first_name', first_name);
                  this.$router.push({ name: 'Home', query: { email } });
                } else {
                  this.error = 'Invalid response format from the server.';
                }
              } else {
                const data = await res.json();
                this.error = data.message || 'Login failed.';
              }
            } catch (error) {
              console.error('An error occurred during login:', error);
              this.error = 'An unexpected error occurred.';
            }
          },

    },
    mounted:function(){
        document.title = "NutriCart.com -Login"
       
    }

})

export default Login