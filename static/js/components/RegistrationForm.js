const RegistrationForm = {
    template:`<div>
    
    <div class="container">
    <div class="card my-3" style="background-color:#d8e8ff">
    <div class="card-body">
    <h3 style="text-align: center;">Register</h3>
        <div class="mb-3">
            <label for="p3" class="form-label">Register as : <span style="color: red;"><b>*</b></span></label>
            <select id="p3" v-model="user_data.role" required>
                <option disabled selected>Select Role</option>
                <option >manager</option>
                <option >user</option>
            </select>
        </div>
        <div class="mb-3">
            <label for="exampleFormControlInput1" class="form-label">First name : <span
                    style="color: red;"><b>*</b></span></label>
            <input type="text" class="form-control"   required id="exampleFormControlInput1"
                placeholder="Choose a unique username" v-model="user_data.first_name" />
        </div>

        <div class="mb-3">
            <label for="exampleFormControlInput2" class="form-label">Email address : <span
                    style="color: red;"><b>*</b></span></label>
            <input type="email" class="form-control"  required id="exampleFormControlInput2"
                placeholder="name@example.com" v-model="user_data.email"/>
        </div>

        <div class="mb-3">
            <label for="exampleFormControlTextarea3" class="form-label">Address : </label>
            <textarea class="form-control" id="exampleFormControlTextarea3"
            required placeholder="Enter your complete address" rows="2" v-model="user_data.address"></textarea>
        </div>

        <div class="mb-3">
            <label for="exampleFormControlInput4" class="form-label">Pin Code : </label>
            <input type="text" class="form-control" maxlength="6" pattern="[0-9]{6}" id="exampleFormControlInput4" 
            required  placeholder="Enter your 6-digit PIN code"   v-model="user_data.pincode"/>
        </div>

        <div class="mb-3">
            <label for="exampleInputPassword6" class="form-label">Password : <span
                    style="color: red;"><b>*</b></span></label>
            <input type="password" class="form-control" id="exampleInputPassword6" required 
                placeholder="Enter a password (8-16 characters)"  v-model="user_data.password">
        </div>
        <div class="mb-3">
            <label  class="form-label">Confirm Password : <span
                    style="color: red;"><b>*</b></span></label>
            <input type="password" class="form-control"  required 
                placeholder="Enter a password (8-16 characters)"  v-model="user_data.confirmed_password">
        </div>
        <div class="mb-3 form-check">
            <input type="checkbox" class="form-check-input" required id="exampleCheck1">
            <label class="form-check-label" for="exampleCheck1">I confirm that the above details are correct.</label>
        </div>
        <button type="submit" class="btn btn-primary" @click="doRegistration">Sign Up</button><hr>
        <ul>
            <li v-for="error in errors" style="color:red;">{{error}}</li>
        </ul>
        </div>
        </div>
        </div>
        </div>

    `
    
    ,
    data() {
        return {
           
            errors:[],
            user_data:{
                first_name: null,
                email: null,
                address:null,
                password: null,
                confirmed_password:null,
                pincode:null,
                role:"Select Role",
            }
        }
    },  
    methods: {
        async doRegistration() {
          // Validate password confirmation
          if (this.user_data.password !== this.user_data.confirmed_password) {
            this.errors.push("Password and confirmed password do not match.");
            return;
          }
    
          try {
            const res = await fetch('/registration', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(this.user_data),
            });
    
            const data = await res.json();
    
            if (res.ok) {
              this.$router.push({ name: 'Login' });
            } else {
              this.errors.push(data.message);
            }
          } catch (error) {
            console.error('An unexpected error occurred:', error);
            this.errors.push("An unexpected error occurred.");
          }
        },
      },
      mounted: function () {
        document.title = "Register"
    }
                

}

export default RegistrationForm