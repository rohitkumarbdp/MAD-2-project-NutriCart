
  const UserHome = Vue.component("UserHome",{
    template: `
    <div class="container mt-4">
    <div class="jumbotron">
        <h6 class="display-6" v-if="first_name == 'null' || first_name == ''">Welcome to User Dashboard</h6>
        <h6 class="display-6" v-else>Welcome {{first_name}}</h6>
    </div>
    
    <p class="lead" v-if="category.hasOwnProperty('message')">{{ category['message'] }}</p>
    <div class="row justify-content-around mt-4" v-else>
        <div v-for="(item, index) in category" :key="index" class="col-md-4 mb-4">
            <div class="card h-100">
                <img :src="getImageUrl(item)" class="card-img-top" alt="Category Image" @error="setDefaultImage"
                    style="max-height: 150px;">
                <div class="card-body">
                    <h5 class="card-title">{{ item }}</h5>
                    <p class="card-text">Explore products in this category.</p>
                    <button class="btn btn-primary" @click="seeProductUser(index, UserEmail, item)"
                        style="background-color:brown;border-color:brown">See Products</button>
                </div>
            </div>
        </div>
    </div>
</div>
  `,
    data() {
      return {
        category: {},
        UserEmail: localStorage.getItem('email'),
        first_name: localStorage.getItem('first_name'),
      }
    },
    methods: {
        fetchAllCategoryForUser() {
          const url = `/all-categories`;
          fetch(url)
            .then(response => response.json())
            .then(data => (this.category = data))
            .catch(error => console.log("Error:", error));
        },
        seeProductUser(id, userEmail, cat) {
          this.$router.push(`/products/${id}/${userEmail}/${cat}`);
        },
        
        getImageUrl(category) {
          const categoryImageMap = {
            'Vegetables': '/static/images/vegetables.png',
            'Sports': '/static/images/sports.png',
            'Medicines': '/static/images/medicine.png',
            'Fruits': '/static/images/fruit.png',
            'Dairy': '/static/images/dairy.png',
            'Pulses': '/static/images/pulses.png',
            'Oils': '/static/images/oil.png',
            'Spices': '/static/images/spices.png',
            'Grains': '/static/images/grains.png',
          };
          return categoryImageMap[category] || '/static/images/default.png';
        },
        setDefaultImage(event) {
            // Replace the source with the URL of your default image
            event.target.src = '/static/images/default.png';
          },
      },
    mounted() {
      this.fetchAllCategoryForUser();
      document.title = "NutriCart.com -Home"
    },
  });
  export default UserHome;