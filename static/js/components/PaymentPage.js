const PaymentPage = {
    template:`<div>
                <div class="container mt-4">
                <h1 class="text-center" style="color:brown">Final Payment </h1>
                <div class="table-container">
                    <table class="table table-striped table-hover">
                        <thead>
                            <tr>
                                <th style="color:brown">Seq No</th>
                                <th style="color:brown">Product Name</th>
                                <th style="color:brown">Rate (per unit)</th>
                                <th style="color:brown">Quantity</th>
                                <th style="color:brown">Subtotal</th>
                            </tr>
                        </thead>
                        <tbody>
                                <tr v-for="(value,key) in data.items">
                                    <td>{{ key+1 }}</td>
                                    <td >{{ value['product_name'] }}</td>
                                    <td>{{ value['rate'] }} /{{ value['unit'] }}</td>
                                    <td>{{ value['quantity'] }} {{ value['unit'] }}</td>
                                    <td>{{ value['rate'] * value['quantity'] }} &#8377;</td>
                                </tr>
                            <tr class="table-primary">
                                <td colspan="4" class="text-end" style="color:brown"><strong>Grand Total:</strong></td>
                                <td style="color:brown"><strong>{{ data['grandTotal'] }} &#8377;</strong></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div class="payment-box">
                    <button class='btn btn-success float-end'  @click='completePayment()'>Make Payment</button>
                </div>
            </div>
            <!-- Bootstrap Modal for Payment Success -->
      <div class="modal" id="paymentSuccessModal" tabindex="-1">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Payment Status:</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close" @click="closeSuccessModal"></button>
            </div>
            <div class="modal-body">
              <p>{{ msessageFromBackend }}</p>
            </div>
            <div class="modal-footer">

              <button class="btn btn-danger" style="background-color:brown;border-color:none" @click="sendToHome()">Go to Homepage</button>
            </div>
          </div>
        </div>
      </div>
        </div>`,
    data(){
        return {
            userEmail:localStorage.getItem('email'),
            data:{},
            msessageFromBackend:'',

        }
    },
    methods: {
        async fetchData() {
          try {
            const response = await fetch(`/make-payment/${this.userEmail}`);
            if (!response.ok) {
              throw new Error(`HTTP error! Status: ${response.status}`);
            }
            this.data = await response.json();
          } catch (error) {
            console.error('Error fetching data:', error);
          }
        },
        async completePayment() {
          try {
            const response = await fetch(`/final-payment/${this.userEmail}`);
            if (!response.ok) {
                this.msessageFromBackend = "Server Error! Unable to Complete Payment"
                this.openSuccessModal()
              throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const msg= await response.json();
            this.msessageFromBackend = msg.message;
            this.openSuccessModal();
          } catch (error) {
            console.error('Error processing payment:', error);
          }
        },
        openSuccessModal() {
            $('#paymentSuccessModal').modal('show');
        },
        closeSuccessModal() {
            $('#paymentSuccessModal').modal('hide');
        },
        sendToHome(){
            this.closeSuccessModal()
            this.$router.push({ path: '/' });
        },
       
    },
    mounted() {
        this.fetchData();
    },
}
export default PaymentPage