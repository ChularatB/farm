import "./css/main.css";

export default function Home() {
  return (
    <div className="m-10 pb-10 flex items-center justify-between overflow-hidden">
      <section className="w-full gap-10 ">
        <h2>หน้าหลัก</h2>
        <div className="card-display">
          <div className="px-5 my-10 justify-center text-center">
            <h1 className="text-2xl">สภาพโดยรวมภายในฟาร์ม</h1>
            <p className="text-xs">วันที่ 20/06/2024</p>
            <h3 className="my-15 text-7xl text-green-400">ปกติ</h3>
          </div>
          <div className="section-card"><h2>อุณหภูมิ</h2> <p>72</p></div>
          <div className="section-card"><h2>ปริมาณน้ำ </h2> <p>72</p></div>
          <div className="section-card"><h2>ปริมาณแสง</h2> <p>72</p></div>
          <div className="section-card"><h2>ความชื้นในดิน</h2> <p>72</p></div>
          <div className="section-card"><h2>ความชื้นในอากาศ</h2> <p>72</p></div>
         
        </div>
      </section>
     
    </div>
  );
}
