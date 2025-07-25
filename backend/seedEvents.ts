import Event, { sampleEvents } from "./src/models/Event"; // ✅ ใช้เส้นทางที่ถูกต้อง

const seedEvents = async () => {
  try {
    //await Event.deleteMany();
    //console.log("🧹 Cleared old events");

    await Event.insertMany(sampleEvents);
    console.log("🌱 Seeded events successfully");
  } catch (error) {
    console.error("❌ Seed error:", error);
  }
};

export default seedEvents;
