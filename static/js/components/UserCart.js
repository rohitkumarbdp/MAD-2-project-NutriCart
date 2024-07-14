const UserCart = {
  template: `
  <div class="container">
  <div class="d-flex justify-content-center mt-5" v-if="cartProducts.hasOwnProperty('message')">
      <div class="mb-3 p-5 bg-light">
          <p><b>{{ cartProducts['message'] }}</b></p>
      </div>
  </div>
  <div v-else>
      <table class="table">
          <thead>
              <tr>
                  <th style="color:brown">Seq No</th>
                  <th style="color:brown">Product name</th>
                  <th style="color:brown">Manufacture Date</th>
                  <th style="color:brown">Expiry Date</th>
                  <th style="color:brown">Rate</th>
                  <th style="color:brown">Quantity</th>
                  <th style="color:brown; padding-left:60px">Action</th>
              </tr>
          </thead>
          <tbody>
              <tr v-for="(product, product_id, seq) in cartProducts" :key="product_id">
                  <td>{{ seq+1 }}</td>
                  <td>{{ product["product_name"] }}</td>
                  <td>{{ product["manufacture_date"] }}</td>
                  <td>{{ product["expiry_date"] }}</td>
                  <td>{{ product["rate"] }} &#8377; /{{ product["unit"] }}</td>
                  <td v-for="(cartItem, key) in cartData" :key="key"
                      v-if="isProductMatchCartQuantity(key, product_id)">
                      {{ cartItem.quantity }} {{ product["unit"] }}
                  </td>
                  <td>
                      <button class="btn btn-outline-dark" @click="openEditQuantityModal(product_id)">Edit
                          Quantity</button>
                      <button class="btn btn-outline-danger" @click="removeProductFromCart(product_id)">Remove</button>
                  </td>
              </tr>
          </tbody>
      </table>
      <button class="btn btn-success " @click="makePayment()">Confirm Order</button>
  </div>


  <!-- Addding Modal to Edit quantity -->
  <div class="modal" id="editQuantityModal" tabindex="-1">
      <div class="modal-dialog">
          <div class="modal-content">
              <div class="modal-header">
                  <h5 class="modal-title">Edit Quantity</h5>
                  <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"
                      @click="closeEditQuantityModal"></button>
              </div>
              <div class="modal-body">
                  <label for="newQuantity">New Quantity:</label>
                  <input v-model="newQuantity" id="newQuantity" type="number">
                  <div v-if="error" class="text-danger">{{ error }}</div>
              </div>
              <div class="modal-footer">
                  <button type="button" class="btn btn-secondary" data-bs-dismiss="modal"
                      @click="closeEditQuantityModal">Close</button>
                  <button type="button" class="btn btn-primary" style="background-color:brown;border:none;" @click="saveEditedQuantity">Update Quantity</button>
              </div>
          </div>
      </div>
  </div>
</div>
      `,
  data() {
    return {
      error: null,
      cartData: null,
      userEmail: localStorage.getItem("email"),
      cartProducts: null,
      product_id: null,
      newQuantity: null,
    };
  },
  methods: {
    async fetchCartForUser() {
      try {
        const apiUrl = `/user-cart/${this.userEmail}`;
        const response = await fetch(apiUrl);
        if (response.ok) {
          this.cartData = await response.json();
        } else {
          const errorMessage = `Failed to fetch user cart. Status: ${response.status}`;
          console.error(errorMessage);
          // Handle the error as needed, e.g., show an error message to the user.
        }
      } catch (error) {
        console.error("Error fetching user cart:", error);
      }
    },
    async fetchProductDetailsInCart() {
      try {
        const apiUrl = `/product-details-cart/${this.userEmail}`;
        const response = await fetch(apiUrl);

        if (response.ok) {
          this.cartProducts = await response.json();
          // console.log(this.cartProducts)
        } else {
          const errorMessage = `Failed to fetch user cart products. Status: ${response.status}`;
          console.error(errorMessage);
        }
      } catch (error) {
        console.error("Error fetching user cart products:", error);
      }
    },
    async removeProductFromCart(productId) {
      try {
        const response = await fetch(
          `/remove-cart-item/${this.userEmail}/${productId}`,
          { method: "POST" }
        );
        if (response.ok) {
          this.fetchProductDetailsInCart();
        } else {
          const data = await response.json();
          this.error = data.message;
          console.error("Failed to delete from cart");
        }
      } catch (error) {
        console.error("Error:", error);
      }
    },
    makePayment() {
      this.$router.push({
        name: "PaymentPage",
        params: { userEmail: this.userEmail },
      });
    },
    openEditQuantityModal(productId) {
      this.product_id = productId; // set the current product_id
      this.newQuantity = null; // reset newQuantity
      this.error = null; // reset error
      $("#editQuantityModal").modal("show"); // show the modal
    },
    closeEditQuantityModal() {
      $("#editQuantityModal").modal("hide"); // hide the modal
    },
    async saveEditedQuantity() {
      try {
        const response = await fetch(
          `/edit-cart-item-quantity/${this.userEmail}/${this.product_id}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              quantity: this.newQuantity,
            }),
          }
        );

        const data = await response.json();

        if (response.ok) {
          this.fetchCartForUser();
          await this.fetchProductDetailsInCart();
          this.closeEditQuantityModal(); // hide the modal
        } else {
          this.error = data.message;
          console.error("Failed to edit product");
        }
      } catch (error) {
        this.error = "An error occurred while processing your request.";
        console.error("Error:", error);
      }
    },
  },
  computed: {
    isProductMatchCartQuantity() {
      return (cartProductId, productProductId) =>
        cartProductId === productProductId;
    },
  },
  mounted() {
    this.fetchCartForUser();
    this.fetchProductDetailsInCart();
  },
};
export default UserCart;
