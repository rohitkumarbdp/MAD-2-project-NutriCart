const Inbox = {
    template:`<div>
                   <center><h3>Requests from Managers</h3></center>
                   
                   <div v-if="error" class="my-5"><center><b>{{ error }}</b></center></div>

                   <table class='table my-3 ' v-else>
                    <thead>
                    <tr>
                        <th>Seq No</th>
                        <th>Email</th>
                        <th>Request Type</th>
                        <th>Category</th>
                        <th>Requested Change</th>
                        <th>Reason</th>
                        <th>Action</th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr v-for="(request, key) in data" :key="key">

                        
                        <td>{{ key+1 }}</td>
                        <td>{{ request['email'] }}</td>
                        <td>{{ request['type_of'] }}</td>
                        <td>{{request['nameBeforeChange']}}</td>
                        <td>{{request['actionInput']}}</td>
                        <td>{{request['actionReason']}}</td>
                        <td v-if="request['type_of']=='delete'">
                        <button class='btn btn-danger' @click="approveDelete(request['actionID'])">Approve Delete</button>
                        <button class='btn btn-warning' @click="rejectAction(request.id)">Reject</button>
                        </td>
                        <td v-if="request['type_of']=='add' ">
                        <button class='btn btn-success' @click="approveAdd(request['actionInput'])">Approve Add</button>
                        <button class='btn btn-warning' @click="rejectAction(request.id)">Reject</button>
                        </td>
                        <td v-if="request['type_of']=='edit' ">
                        <button class='btn btn-primary' @click="approveEdit(request['actionID'],request['actionInput'])">Approve Edit</button>
                        <button class='btn btn-warning' @click="rejectAction(request.id)">Reject</button>
                        </td>
                    </tr>
                    </tbody>
                </table>
              </div>`,
    data(){
        return {
            data:{},
            error:null
        }
    },
    methods: {
        fetchInboxRequests() {
            const url = "/all-requests";
            fetch(url)
              .then((response) => {
                if (!response.ok) {
                    console.log("hello babe")
                  throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
              })
              .then((data) => {
                if (data.hasOwnProperty("message")) {
                  console.log(data.message); // Printing the message to the console 
                  this.error=data.message
                } else {
                  this.data = data; // Updating  local data if there are requests
                }
              })
              .catch((error) => console.error("Error fetching inbox requests:", error));
          },
        async approveDelete(cat_id) {
          try {
            const response = await fetch(`/approve-category-delete/${cat_id}`, { method: 'POST' });
            if (response.ok) this.fetchInboxRequests();
            else console.error('Error deleting product:', response.statusText);
          } catch (error) {
            console.error('Error deleting product:', error);
          }
        },
        async approveAdd(cat_name) {
          try {
            const response = await fetch("/approve-add-category", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ category_name:cat_name }),
            });
            if (response.ok) this.fetchInboxRequests();
            else console.error("Failed to add category:", response.statusText);
          } catch (error) {
            console.error("Error:", error);
          }
        },
        async approveEdit(cat_id, new_cat_name) {    
          try {
            const response = await fetch(`/approve-category-edit/${cat_id}`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ category_name: new_cat_name }),
            });
            if (response.ok) this.fetchInboxRequests();
            else console.error("Failed to edit category:", response.statusText);
          } catch (error) {
            console.error("Error:", error);
          }
        },
        async rejectAction(requestId) {
            try {
              const response = await fetch(`/reject-request/${requestId}`, {
                method: 'POST',
              });
        
              if (response.ok) {
                console.log('Request rejected successfully');
                // update  local data 
                this.fetchInboxRequests();
              } else {
                console.error('Failed to reject request:', response.statusText);
              }
            } catch (error) {
              console.error('Error rejecting request:', error);
            }
          },
      }, 
    mounted() {
        this.fetchInboxRequests();
    },         
}

export default Inbox