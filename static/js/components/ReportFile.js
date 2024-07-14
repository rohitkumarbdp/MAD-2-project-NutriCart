const ReportFile  ={
    template:`
    <div class="container bg-light d-flex align-items-center justify-content-center" style="height: 50vh;">
    <div class="card" style="width: 18rem; background-color: #f8d7da;">
    <div class="card-body">
        <h5 class="card-title">Download Sales Report:</h5>
        <button class="btn btn-danger" style="background-color:brown; border:none;" @click="download_report">Download Report</button>
        <span v-if="isWaiting" class="ml-2">Waiting....</span>
    </div>
</div>`,
    data() {
        return {
            data:{},
            isWaiting:false,
        }
    },      
    methods:{
      async download_report() {
        try {
          this.isWaiting = true;
  
          const res = await fetch('/download-csv');
          if (!res.ok) {
            throw new Error('Failed to initiate download: ' + res.statusText);
          }
  
          const data = await res.json();
          const task_id = data['task-id'];
  
          const intv = setInterval(async () => {
            const csv_res = await fetch(`/get-csv/${task_id}`);
            if (csv_res.ok) {
              this.isWaiting = false;
              clearInterval(intv);
              window.location.href = `/get-csv/${task_id}`;
            }
          }, 1000);
        } catch (error) {
          console.error(error.message);
          this.isWaiting = false;
        }
      },
    },
  };
      


export default ReportFile