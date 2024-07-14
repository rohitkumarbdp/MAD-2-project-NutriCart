const SeeProducts = Vue.component("SeeProducts", {
  template: `<div class="container">
              <div class="card">
              <div class="card-header">
                <div class="header-container">
                  
                  <p class="category-heading" style="color: brown; font-size: 24px; text-align: center;">
                  Category: {{ cat_name }} &nbsp;&nbsp;&nbsp;&nbsp;
                  <button class="btn btn-secondary" @click="addProduct" >+ Add New Product</button></p>
                </div>
              </div>
              </div> 

              <div v-if="products.hasOwnProperty('message')">
                <h1>{{ products['message'] }}</h1>
              </div>
              <table class='table' v-else>
              <thead>
                <tr>
                  <th style="color:brown">Seq No</th>
                  <th style="color:brown">Product ID</th>
                  <th style="color:brown">Product name</th>
                  <th style="color:brown">Rate</th>
                  <th style="color:brown">Manufacture Date</th>
                  <th style="color:brown">Expiry Date</th>
                  <th style="color:brown">Stock Available</th>
                  <th style="color:brown; padding-left: 80px;">Action</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(product, seq ) in products">
                  <td>{{ seq+1 }}</td>
                  <td>{{ product.product_id }}</td>
                  <td>{{ product.product_name }}</td>
                  <td>{{ product.rate }} &#8377; /{{ product.unit }}</td>
                  <td>{{ product.manufacture }}</td>
                  <td>{{ product.expiry }}</td>
                  <td>{{ product.stock_quantity }} {{ product.unit }}</td>
                  <td>
                    <button class='btn btn-outline-dark' @click="editProduct(product.product_id)">Edit Product</button>
                    <button class='btn btn-outline-danger' @click="deleteProduct(product.product_id)">Remove Product</button>
                    
                  </td>
                </tr>
              </tbody>
            </table>
            
            </div>`,

  data() {
    return {
      category_id: this.$route.params.id,
      cat_name: this.$route.params.cat,
      products: {},
    };
  },
  methods: {
    fetchProductDetail() {
      const url = "/products/" + this.category_id;
      fetch(url)
        .then((response) => response.json())
        .then((data) => {
          this.products = data;
        })
        .catch((error) => {
          console.error("Error fetching product details:", error);
        });
    },
    editProduct(id) {
      this.$router.push({
        name: "EditProduct", ///change it
        params: { id: id },
        query: { category_id: this.category_id },
      });
    },
    addProduct() {
      this.$router.push(`/add-product/${this.category_id}/${this.cat_name}` );
    },

    deleteProduct(id) {
      const url = `/delete-product/${id}`;
      fetch(url, {
        method: "DELETE",
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          return response.json();
        })
        .then((result) => {
          console.log("Product deleted successfully:", result);
          this.fetchProductDetail(); // refreshing the list
        })
        .catch((error) => {
          console.error("Error deleting product:", error);
        });
    },
  },

  mounted() {
    this.fetchProductDetail();
  },
});

export default SeeProducts;
