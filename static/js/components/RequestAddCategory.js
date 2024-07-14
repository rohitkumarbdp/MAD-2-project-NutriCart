const requestAddCategory = {
    template: `
      
<div>   
<div class="container my-5">
<div class="card my-1" style="max-width: 300px; margin: auto; border-radius: 10px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
    <div class="card-body">
  <div class="text-danger" v-if="error">*{{ error }}</div>
  <form class="requestform" id="categoryForm" @submit.prevent="requestNewCategory" style="max-width: 400px; margin: auto;">
    <div class="form-group mb-3">
      <label for="categoryName" class="form-label"  style="color:brown;"><b>Category Name:</b></label>
      <input type="text" id="categoryName" v-model="categoryName" name="categoryName" class="form-control" required>
    </div>

    <div class="form-group mb-3">
      <label for="description" class="form-label"  style="color:brown;"><b>Reason:</b></label>
      <input type="text" v-model="actionReason" id="description" name="description" class="form-control" required>
    </div>

    <button type="submit" class="btn btn-primary" style="background-color:brown;border-color: brown;">Send Request</button>
  </form>
</div>
</div>
</div>
</div>

    `,
    data() {
      return {
        categoryName: null,
        error: null,
        actionReason:null,
        userEmail: localStorage.getItem('email'),
      };
    },
    methods: {
        async requestNewCategory() {
          const { userEmail, categoryName } = this;
      
          if (!categoryName) {
            this.error = 'Please enter a valid category name';
            return;
          }
      
          try {
            const response = await fetch(`request-add-category/${userEmail}`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                'categoryName':this.categoryName,
                'actionReason':this.actionReason
              }),
            });
      
            const data = await response.json();
      
            if (response.ok) {
              this.$router.push('/');
            } else {
              this.error = data.message;
              console.error('Failed to add category');
            }
          } catch (error) {
            console.error('Error:', error);
          }
        },
      },
      
  };
  
  export default requestAddCategory;
  