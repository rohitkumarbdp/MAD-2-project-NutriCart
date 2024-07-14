export default {
  template: `
  <div class="container">
  <nav class="navbar navbar-expand-lg bg-body-tertiary ">
  <div class="container-fluid">
  
  <router-link class="nav-link navbar-brand active" aria-current="page" style="color:brown" to="/">NutriCart.com</router-link>
    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
      <span class="navbar-toggler-icon"></span>
    </button>
    <div class="collapse navbar-collapse" id="navbarNav">
      <ul class="navbar-nav">
        <li class="nav-item">
          <router-link class="nav-link active" aria-current="page" to="/">Home</router-link>
        </li>
        <li class="nav-item">
          <a type="button" @click="goToCart" v-if="role === 'user'" class="nav-link active" aria-current="page" >Cart</a>
        </li>
        <li class="nav-item">
        <router-link v-if="role === 'admin'" class="nav-link active" aria-current="page" to="/inbox">Inbox</router-link>
        </li>
        <li class="nav-item" v-if="role === 'admin'">
          <router-link class="nav-link active" to="/activate-managers">Approve Managers</router-link>
        </li>
        <li class="nav-item" v-if="role === 'admin'">
          <router-link class="nav-link active" to="/dismiss-managers">Dismiss Managers </router-link>
        </li>
        <li class="nav-item" v-if="role === 'manager'">
          <router-link class="nav-link active" to="/see-report">See Report</router-link>
        </li>
        <li class="nav-item" v-if="is_login">
          <button class="nav-link active"   @click="logout">Logout</button>
        </li>
        <li class="nav-item" v-if="!is_login">
          <router-link class="nav-link active" aria-current="page" to="/register">Register</router-link>
        </li>
      </ul>
      <form class="d-flex ms-auto" role="search" v-if="role === 'user'" @submit.prevent="onSearch">
        <input  v-model="searchTerm" class="form-control me-2" type="search" placeholder="Search Products" aria-label="Search">
        <button class="btn btn-outline-success" type="submit">Search</button>
      </form>
    </div>
  </div>
  </nav>
  </div>`
,
data() {
  return {
    role: localStorage.getItem('role'),
    cred: {
      email: localStorage.getItem('email')
    },
    is_login: localStorage.getItem('auth-token'),
    key: 0,
    error: '',
    message: '',

    searchTerm:''
    
  };
},
methods: {
  async logout() {
    try {
      const res = await fetch('/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(this.cred),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.removeItem('email');
        localStorage.removeItem('auth-token');
        localStorage.removeItem('role');
        localStorage.removeItem('first_name');
        this.$router.push({ path: '/login' });
      } else {
        this.error = data.message;
      }
    } catch (error) {
      console.error('An error occurred during logout:', error);
      this.error = 'An unexpected error occurred.';
    }
  },
  goToCart() {
    this.$router.push({ name: "UserCart", params: { userEmail: this.cred.email } });
  },
  onSearch(){
    this.$router.push({ name: "SearchBar", params: { term: this.searchTerm } });
  }
},
};