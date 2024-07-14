
const ActivateManagers=Vue.component("ActivateManagers",{
    template:`<div class="container">
              <div v-if="Object.keys(inactiveManagers).length === 0">
                <h2>There are currently no pending requests to approve new managers.</h2>
              </div>
              <div v-else>
              <table class='table'>
              <thead>
                <tr>
                  <th>Seq No</th>
                  <th>Manager email</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(value, key,seq) in inactiveManagers" :key="key">
                  <td>{{ seq+1 }}</td>
                  <td>{{ value }}</td>
                  <td>
                    <button class='btn btn-success' @click="activateManager(value)">Approve Manager </button>
                    <button class="btn btn-danger" @click="rejectManager(value)">Reject Manager</button>
                  </td>
                  
                </tr>
                
              </tbody>
            </table>
            <p v-if="error" class="text-danger">{{error}}</p>
            </div>
            </div>`,
  
    data() {
      return {
        inactiveManagers:{},  
        message:'',
        error: '',
      }
    }, 
    methods:{
        fetchInactiveManagers() {
          const url = "/inactive-managers";
          fetch(url)
            .then(response => response.json())
            .then(data => {
              this.inactiveManagers = data;
            })
            .catch(error => {
              console.error("Error:", error);
            });
        },
        activateManager(email) {
          const url = `/activate/manager/${email}`;
          console.log(url) // look after
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
              console.log('Manager activated:', result);
              this.fetchInactiveManagers();   /// Refresh the request list
            })
            .catch(error => {
              console.error('Error activating manager:', error);
              this.error= error;
            });
        },
        rejectManager(email) {
          const url = `/reject/manager/${email}`;
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
              console.log('Manager rejected:', result);
              this.fetchInactiveManagers(); // Refresh the request list
            })
            .catch(error => {
              console.error('Error rejecting manager:', error);
              this.error = error;
            });
        },
      }, 
    mounted() {
      this.fetchInactiveManagers();
    },
   
  })
  
  export default ActivateManagers