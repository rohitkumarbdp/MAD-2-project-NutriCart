const RequestEditCategory = Vue.component("RequestEditCategory", {
  template: `
  <div>
  <div class="card my-5" style="max-width: 300px; margin: auto; border-radius: 10px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
    <div class="card-body">
  <div class="text-danger" v-if="error">*{{ error }}</div>
  <form class="requestform" id="categoryForm" @submit.prevent="onSubmit" style="max-width: 400px; margin: auto;">
    <div class="form-group mb-3">
      <label for="categoryName" class="form-label" style="color:brown"><b>Category Name:</b></label>
      <input type="text" id="categoryName" v-model="category_name" name="categoryName" class="form-control" required>
    </div>

    <div class="form-group mb-3">
      <label for="description" class="form-label" style="color:brown"><b>Reason:</b></label>
      <input type="text" v-model="actionReason" id="description" name="description" class="form-control" required>
    </div>

    <button type="submit" class="btn btn-danger" style="background-color:brown;border-color: brown;">Request Edit</button>
  </form>
</div>
</div>
</div>


    `,

  data() {
    return {
      category_name: null,
      actionReason:null,
      categoryNameBefore:null,
      error: null,
      category_id: this.$route.params.id,
      userEmail: localStorage.getItem("email"),
    };
  },

  methods: {
    async fetchCategoryDetail() {
      try {
        const response = await fetch(`/category-details/${this.category_id}`);
        const data=await response.json();
        this.category_name = data.category_name;
        this.categoryNameBefore = data.category_name;
      } catch (error) {
        console.log("Error:", error);
      }
    },

    async onSubmit() {
      try {
        const response = await fetch(
          `/request-edit-category/${this.category_id}/${this.userEmail}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                category_name: this.category_name,
                actionReason: this.actionReason,
                categoryNameBefore: this.categoryNameBefore
             }),
          }
        );
        const data = await response.json();
        if (response.ok) this.$router.push("/");
        else this.error = data.message || "Failed to edit category";
      } catch (error) {
        console.error("Error:", error);
      }
    },
  },
  mounted() {
    this.fetchCategoryDetail();
    document.title = "Manager-Dashboard";
  },
});

export default RequestEditCategory;
