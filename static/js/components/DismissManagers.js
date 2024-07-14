
const DismissManagers=Vue.component("DismissManagers",{
    template:`<div class="container">
              <div v-if="Object.keys(activeManagers).length === 0">
                <h2>There are currently no active managers.</h2>
              </div>
              <div v-else>
              <center class="my-4"><h3>Dismiss Managers</h3></center>
              <table class='table'>
              <thead>
                <tr>
                  <th>Seq No</th>
                  
                  <th>Manager</th>
                  <th>Manager email</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(manager, seq) in activeManagers">
                  <td>{{ seq+1 }}</td>
                  <td>{{ manager.first_name }}</td>
                  <td>{{ manager.email }}</td>
                  <td>
                    <button class='btn btn-success' @click="dismissManager(manager.email)">Dismiss Manager </button>
                  </td>
                  
                </tr>
                
              </tbody>
            </table>
            <p v-if="error" class="text-danger">{{error}}</p>
            </div>
            </div>`,
  
    data() {
      return {
        activeManagers:{},  
        message:'',
        error: '',
      }
    }, 
    methods:{
        fetchActiveManagers() {
          const url = "/active-managers";
          fetch(url)
            .then(response => response.json())
            .then(data => {
              this.activeManagers = data;
            })
            .catch(error => {
              console.error("Error:", error);
            });
        },
        async dismissManager(email) {
            try {
              const response = await fetch(`/dismiss/manager/${email}`, {
                method: 'DELETE',
              });
              if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
              }
              const result = await response.json();
              console.log('Manager dismissed successfully:', result);
              await this.fetchActiveManagers(); // Refresh active managers list
            } catch (error) {
              console.error('Error dismissing manager:', error);
              this.error = error.message; // Assuming there is an 'error' property to display errors
            }
          },
      }, 
    mounted() {
      this.fetchActiveManagers();
    },
   
  })
  
  export default DismissManagers