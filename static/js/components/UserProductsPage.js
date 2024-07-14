const UserProductsPage = {
  template: `<div class="container">
  <div class="card">
  <div class="card-header">
    <div class="header-container">
      
      <p class="category-heading" style="color: brown; font-size: 24px; text-align: center;">
      Category: {{ cat_name }} &nbsp;&nbsp;&nbsp;&nbsp;
      </p>
    </div>
  </div>
  </div> 

    <div class="d-flex justify-content-center mt-5" v-if="products.hasOwnProperty('message')">
    <div class="mb-3 p-5 bg-light">
      <p><b>{{ products['message'] }}</b></p>
    </div>
    </div>
    <div v-else>
    <table  class="table">
    <thead>
    <tr>
      <th style="color:brown">Seq No</th>
      <th style="color:brown">Product name</th>
      <th style="color:brown">Rate</th>
      <th style="color:brown">Manufacture Date</th>
      <th style="color:brown">Expiry Date</th>
      <th style="color:brown">Stock Available</th>
      <th style="color:brown">Action</th>
    </tr>
  </thead>
      <tbody>
        <tr v-for="(product, seq) in products" >
        <td>{{ seq+1 }}</td>
        <td>{{ product.product_name }}</td>
        <td>{{ product.rate }} &#8377; /{{ product.unit }}</td>
        <td>{{ product.manufacture }}</td>
        <td>{{ product.expiry }}</td>
        <td>{{ product.stock_quantity }} {{ product.unit }}</td>
          <td>
            <button
              @click="addCartProduct(product.product_id)"
              class="btn btn-success"
              data-bs-content="One unit added"
            >
              Add To Cart
            </button>
          </td>
        </tr>
      </tbody>
    </table>
    </div>

    
  </div>`,
  data() {
    return {
      category_id: this.$route.params.id,
      products: {},
      UserEmail: localStorage.getItem("email"),
      error: null,
      cat_name: this.$route.params.cat
    };
  },
  methods: {
    async fetchProductDetail() {
      const url = `/products/${this.category_id}`;
      try {
        const response = await fetch(url);
        const data = await response.json();
        this.products = data;
      } catch (error) {
        console.error("Error:", error);
      }
    },
    async addCartProduct(id) {
      try {
        const response = await fetch(`/add-to-cart/${this.UserEmail}/${id}`, {
          method: "POST",
        });

        if (response.ok) {
          const data = await response.json();
          console.log(data.message);
        } else {
          console.error("Failed to add item to cart:", response.statusText);
        }
      } catch (error) {
        console.error("Error:", error);
      }
    },
    goToCart() {
      this.$router.push({ name: "UserCart", params: { userEmail: this.UserEmail } });
    },
  },
  mounted() {
    this.fetchProductDetail();
  },
};
export default UserProductsPage;
