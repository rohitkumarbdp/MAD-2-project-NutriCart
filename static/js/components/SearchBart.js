const SearchBar = {
  template:`<div>

              <div class="d-flex justify-content-center mt-5" v-if="searchResults.hasOwnProperty('message')">
              <div class="mb-3 p-5 bg-light">
                   <p><b>{{ searchResults['message'] }}</b></p>
              </div>
              </div>
                 
                 <div v-else>
                 <div class="container mt-5">
                      <table class="table table-striped">
                          <thead>
                              <tr>
                                  <th style="color:brown">Seq No</th>
                                  <th style="color:brown">Product Name</th>
                                  <th style="color:brown">Rate</th>
                                  <th style="color:brown">Manufacture Date</th>
                                  <th style="color:brown">Expiry Date</th>
                                  <th style="color:brown">Stock Available</th>
                                  <th style="color:brown">Action</th>
                              </tr>
                          </thead>
                          <tbody>
                              <tr v-for="(product, key) in searchResults" :key="key">
                                  <td>{{key+1 }}</td>
                                  <td>{{ product['product_name'] }}</td>
                                  <td>{{ product['rate'] }}  &#8377; / {{ product['unit'] }}</td>
                                  <td>{{ product['manufacture_date'] }}</td>
                                  <td>{{product['expiry_date'] }}</td>
                                  <td>{{ product['quantity']}} {{ product.unit }}</td>
                                  
                                  <td> <button type="button" class="btn btn-success" @click="addToCart(product.product_id)">Add To Cart </button> </td>
                          </tr>  
                          </tbody>
                      </table>
                  </div>
                 </div>
           </div>`,
  data() {
      return {
          searchResults:null,
          UserEmail: localStorage.getItem('email')
      }
  },
  watch: {
      '$route.params.term': 'searchProducts', // Watch for changes in the route parameter 'term' and trigger the search
    },
  methods: {
    async searchProducts() {
      this.searchResults = null;
      const url = `/search?term=${this.$route.params.term}`;
      try {
        const response = await fetch(url);
        const data = await response.json();
        this.searchResults = data;
      } catch (error) {
        console.error('Error fetching search results:', error);
      }
    },
    async addToCart(productId) {
      try {
        const response = await fetch(`/add-to-cart/${this.UserEmail}/${productId}`, {
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
  },
mounted(){
  this.searchProducts();
}
}
export default SearchBar