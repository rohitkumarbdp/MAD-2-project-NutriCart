const AdminHome = Vue.component("AdminHome", {
  template: `
    <div>
    <div style="max-width: 1000px; margin: 0 auto;">
    <h6 class="display-6" v-if="first_name == 'null' || first_name == ''">Welcome to Admin Dashboard</h6>
    <h6 class="display-6" v-else>Welcome {{first_name}}</h6>
      <div class="button-container">
    <a type="button" @click="addCategory()" class="btn btn-success ">+ Add new category</a>
    </div>

      <div v-if="category && category.hasOwnProperty('message')">
        <h1 style="color: green; text-align: center; margin-bottom: 20px;">{{ category['message'] }}</h1>
      </div>

      <table v-else class="table" style="margin-bottom: 20px;">
        <thead>
          <tr>
            <th>Seq No</th>
            <th>Category ID</th>
            <th>Category Name</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(cat, id, seq) in category">
            <td>{{ seq +1 }}</td>
            <td>{{ id }}</td>
            <td>{{ cat }}</td>
            <td>
              <button @click="editCategory(id)" class="btn btn-outline-dark" style="cursor: pointer;">Edit</button>
              <button @click="deleteCategory(id)" class="btn btn-outline-danger" style="cursor: pointer;">Remove Category</button>
            </td>
          </tr>
        </tbody>
      </table>
      
    </div>

    <!-- Bootstrap Modal for Editing Category -->
    <div class="modal" id="editCategoryModal" tabindex="-1">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">{{ selectedCategoryId ? 'Edit Category' : 'Add New Category' }}</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close" @click="closeEditModal"></button>
        </div>
        <div class="modal-body">
          <label for="newCategoryName">New Category Name:</label>
          <input v-model="newCategoryName" id="newCategoryName" type="text">
          <div v-if="error" class="text-danger">{{ error }}</div>
        </div>
        <div class="modal-footer">
          
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" @click="closeEditModal">Close</button>
          <button type="button" class="btn btn-primary" @click="saveEditedCategory">{{ selectedCategoryId ? 'Save changes' : 'Add Category' }}</button>
        </div>
      </div>
    </div>
  </div>

  </div>
    `,
  data() {
    return {
      category: null,
      first_name: localStorage.getItem("first_name"),
      userEmail: localStorage.getItem("email"),
      newCategoryName: "",
      selectedCategoryId: null,
      error:null,
      isAddingCategory: false,  // Flag to identify whether adding or editing
    };
  },
  methods: {
    async fetchCategoryDetail() {
      try {
        const response = await fetch("/admin-dashboard/" + this.userEmail);
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        this.category = await response.json();
      } catch (error) {
        console.error("Error fetching category details:", error);
      }
    },
    async deleteCategory(id) {
      try {
        const response = await fetch("/category/" + `${id}/delete`, {
          method: "POST",
        });
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const result = await response.json();
        console.log("Category deleted successfully:", result);
        await this.fetchCategoryDetail(); // Refresh category details
      } catch (error) {
        console.error("Error deleting category:", error);
      }
    },
    addCategory() {
      // this.$router.push("/create-category");
      this.isAddingCategory = true;
      this.selectedCategoryId = null; // Reset selectedCategoryId
      $('#editCategoryModal').modal('show');
    },

    editCategory(id) {
      this.selectedCategoryId = id;
      $('#editCategoryModal').modal('show');
    },
    closeEditModal() {
      this.newCategoryName = ""; // Reset the input field
      this.error=null
      this.selectedCategoryId = null;
      this.isAddingCategory = false; // Reset flag
    },
    async saveEditedCategory() {
      try {
        const apiUrl = this.isAddingCategory ? "/create-category" : `/category-edit/${this.selectedCategoryId}`;
        // const method = this.isAddingCategory ? "POST" : "P";
        const response = await fetch(apiUrl,{
          method: 'POST',
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            category_name: this.newCategoryName,
          }),
        });
        if (!response.ok) {
          const result= await response.json()
          this.error = result.message
          console.log(result.message)
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const result = await response.json();
        console.log("Category edited/added successfully:", result);
        await this.fetchCategoryDetail(); // Refresh category details
        this.closeEditModal()
        $('#editCategoryModal').modal('hide');  // hiding the modal when edit completed

      } catch (error) {
        console.error("Error editing category:", error);
      }
    },
  },
  

  mounted: function () {
    document.title = "NutriCart.com-Admin";
    this.fetchCategoryDetail();
    
  },
});
export default AdminHome;
