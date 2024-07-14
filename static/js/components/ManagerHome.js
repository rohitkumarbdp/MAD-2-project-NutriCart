
const ManagerHome = Vue.component("ManagerHome",{
    template: `
      <div>
      <div style="max-width: 1100px; margin: 0 auto;">
      <h6 class="display-6" v-if="first_name == 'null' || first_name == ''">Welcome to Manager Dashboard</h6>
      <h6 class="display-6" v-else>Welcome {{first_name}}</h6>
        <div v-if="category.hasOwnProperty('message2')">
        <center>
          <div class="card my-3" style="width: 18rem;">
            <div class="card-body">
              <h5 class="card-title">{{ category['message2'] }}</h5>
              <button class='btn btn-success' @click="requestAction('add')">Request To Add Category</button>
            </div>
          </div>
        </center>
        </div>

        <div v-if="category.hasOwnProperty('message1')">
        <center>
          <div class="card my-3" style="width: 18rem;">
            <div class="card-body">
              <h5 class="card-title">{{ category['message1'] }}</h5>
            </div>
          </div>
        </center>
        </div>
        
        <div v-else>
        <button class='btn btn-secondary my-3' @click="requestAction('add')">+ Request to Add New Category</button>
          <table class='table'>
            <thead>
              <tr>
                <th style="color:brown">Seq No</th>
                <th style="color:brown">Category ID</th>
                <th style="color:brown">Category name</th>
                <th style="color:brown; padding-left: 180px;" >Action</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(cat, id, seq) in category" :id="id">
                <td>{{ seq+1 }}</td>
                <td>{{ id }}</td>
                <td>{{ cat }}</td>
                <td>
                  <button class='btn btn-outline-success' @click="seeProducts(id, cat)">See Product</button>
                  <button class='btn btn-outline-dark' @click="requestAction('edit', id)">Request Edit</button>
                  <button class='btn btn-outline-danger' @click="requestAction('remove', id)">Request Remove</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      </div>
    `,

  
    data() {
      return {
        category: {},
        userEmail: localStorage.getItem('email'),
        first_name: localStorage.getItem('first_name'),
        showModal: false,
      };
    },
    
    methods: {
      fetchCategoryDetail() {
        const url = `/admin-dashboard/${this.userEmail}`;
        fetch(url)
          .then(response => response.json())
          .then(data => {
            this.category = data;
          })
          .catch(error => console.error("Error:", error));
      },
      seeProducts(id, cat) {
        this.$router.push(`/category/product/${id}/${cat}`);
      },
      requestCategoryDeletion(id) {
        const mail = this.userEmail;
        const url = `/category/${id}/delete/${mail}`;
  
        fetch(url, {
          method: 'POST',
          
        })
          .then(response => {
            if (!response.ok) {
              throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
          })
          .then(result => {
            console.log('Category deletion request sent successfully:', result);
            this.fetchCategoryDetail();
          })
          .catch(error => {
            console.error('Error sending category deletion request:', error);
          });
      },
      requestAction(action, id = null) {
        switch (action) {
          case 'add':
            this.$router.push('/request-add-category');
            break;
          case 'remove':
            this.requestCategoryDeletion(id);
            break;
          case 'edit':
            this.$router.push(`/request-edit-category/${id}`);
            break;
          default:
            console.error('Invalid action:', action);
        }
      }
    },
    mounted() {
      this.fetchCategoryDetail();
      document.title = "Manager-Dashboard";
    },
    computed: {
    },
    
});
  
  export default ManagerHome;
  