const AddProduct = Vue.component("AddProduct", {
  template: `
    <div>
    
    <div class="container" >
    <div class="card my-3" style="background-color:#d8e8ff">
    <div class="card-body">
      <h4 class="card-title">Add new product in <span style="color: brown;">{{cat_name}} Category</span></h4>
    <form @submit.prevent="onSubmit" class="my-3">
    <div class="mb-3">
      <label for="p1" class="form-label">Product name : <span style="color: red;"><b>*</b></span></label>
      <input type="text" v-model="new_product.product_name" class="form-control" id="p1" placeholder="Example: Fruit" required>
    </div>
    <div class="mb-3">
      <label for="p2" class="form-label">Rate per unit : <span style="color: red;"><b>*</b></span></label>
      <input type="number" v-model="new_product.rate" class="form-control" id="p2" placeholder="Example: 100" required>
    </div>
    <div class="mb-3">
      <label for="p3" class="form-label">Select Unit : <span style="color: red;"><b>*</b></span></label>
      <select v-model="new_product.unit" id="p3" required>
        <option value="" disabled>Select Unit</option>
        <option value="kg">Kilogram (kg)</option>
        <option value="g">Gram (g)</option>
        <option value="lit">Liter (lit)</option>
        <option value="packet">Packet</option>
        <option value="dz">Dozen (dz)</option>
        <option value="ml">Milliliter (ml)</option>
        <option value="piece">Piece</option>
      </select>
    </div>
    <div class="mb-3">
      <label for="p4" class="form-label">Manufacture date :</label>
      <input type="date" v-model="new_product.manufacture" class="form-control" id="p4">
    </div>
    <div class="mb-3">
      <label for="p5" class="form-label">Expiry date :</label>
      <input type="date" v-model="new_product.expiry" class="form-control" id="p5">
    </div>
    <div class="mb-3">
      <label for="p6" class="form-label">Stock to be added : <span style="color: red;"><b>*</b></span></label>
      <input type="number" v-model="new_product.stock_quantity" class="form-control" id="p6" placeholder="Example: 100" required>
    </div>
    <div class="mb-3 form-check">
      <input type="checkbox" class="form-check-input" id="p7" required>
      <label class="form-check-label" for="p7">Confirm above details are correct!</label>
    </div>
    <button type="submit" class="btn btn-primary">Submit</button>
  </form>
  <div v-if="error" class='text-danger' > {{error}}</div>
</div>

    </div>
    </div>
    </div>
    `,
  data() {
    return {
        new_product:{
            product_name:null,
            rate:null,
            unit:null,
            manufacture: null,
            expiry:null,
            stock_quantity:null,
            category_id:this.$route.params.id,
        },
        error: null,
        cat_name: this.$route.params.cat,
      
    };
  },
  methods: {
    async onSubmit() {
      if (this.new_product.product_name && this.new_product.unit && this.new_product.rate && this.new_product.stock_quantity) {
        try {
          const response = await fetch(
            `/add-product/${this.new_product.category_id}`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(this.new_product),
            }
          );
          const data = await response.json();
          if (response.ok) {
            this.$router.push("/category/product/" + this.new_product.category_id);
          } else {
            this.error = data.message;
            console.error("Failed to add product");
          }
        } catch (error) {
          console.error("Error:", error);
        }
      } else {
        this.error = "Please fill all the required fields";
      }
    },
  },

  mounted: function () {
    document.title = "NutriCart.com - Manager";
  },
});

export default AddProduct;
