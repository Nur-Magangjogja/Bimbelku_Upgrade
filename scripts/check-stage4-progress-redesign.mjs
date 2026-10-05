import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), "utf8");
const exists = (relativePath) => fs.existsSync(path.join(root, relativePath));
const failures = [];
const expect = (condition, message) => { if (!condition) failures.push(message); };

const app = read("src/App.tsx");
const progress = read("src/pages/students/LearningProgress.tsx");
const detail = read("src/pages/students/LearningProgressDetail.tsx");
const progressLib = read("src/lib/studentProgress.ts");
const packages = read("src/pages/students/MyPackages.tsx");
const myClasses = read("src/pages/students/MyClasses.tsx");
const cheapStudent = read("src/pages/students/CheapClasses.tsx");
const cheapTeacher = read("src/pages/teacher/CheapClasses.tsx");
const account = read("src/pages/students/Account.tsx");
const landing = read("src/components/DashboardPreviewSection.tsx");
const how = read("src/components/HowItWorksSection.tsx");
const cheapController = read("bimbelku-backend/app/Http/Controllers/Api/CheapClassController.php");
const cheapTeacherController = read("bimbelku-backend/app/Http/Controllers/Api/TeacherCheapClassController.php");
const cheapService = read("bimbelku-backend/app/Services/CheapClassService.php");
const packageController = read("bimbelku-backend/app/Http/Controllers/Api/StudentPackageController.php");
const studentController = read("bimbelku-backend/app/Http/Controllers/Api/StudentController.php");
const routes = read("bimbelku-backend/routes/api.php");
const cheapTest = read("bimbelku-backend/tests/Feature/CheapClassWorkflowTest.php");

expect(!exists("src/components/StudentWorkspaceList.tsx"), "StudentWorkspaceList lama masih tersisa padahal tidak lagi dipakai");
expect(app.includes('path="/student/progress/:kind/:id"') && app.includes("LearningProgressDetail"), "route detail Progress belum tersedia");
expect(progress.includes('scope: "progress"') && progress.includes('to={`/student/progress/package/${item.id}`}') && progress.includes('to={`/student/progress/cheap-class/${item.id}`}'), "halaman Progress belum menjadi daftar program per paket");
expect(progressLib.includes("packageChapterStats") && progressLib.includes("cheapClassChapterStats"), "perhitungan progress materi belum dipisahkan dari pemakaian sesi");
expect(detail.includes("stats.tracksChapters") && detail.includes("bukan penguasaan materi") && detail.includes("Progress materi dihitung dari Bab"), "detail Paket Belajar harus membedakan progress Bab lama, pertemuan selesai, dan penilaian tutor");
expect(detail.includes('initialTab="progress"') && detail.includes("package_subject_id"), "laporan tutor lama belum tetap dapat dibuka dari detail paket baru");

expect(packages.includes("Pemakaian sesi") && packages.includes("Bukan persentase penguasaan materi"), "Kelas Saya masih menyebut pemakaian sesi sebagai progress materi");
expect(packages.includes('to={`/student/progress/package/${item.id}`}') && packages.includes("Lihat Progress"), "Kelas Saya belum memiliki shortcut detail Progress paket");
expect(
  cheapStudent.includes('to={`/student/progress/cheap-class/${item.id}`}')
    || (myClasses.includes('`/student/progress/cheap-class/${group.id}`') && myClasses.includes("Lihat progress")),
  "Kelas Saya murid belum memiliki shortcut detail Progress Kelas Kelompok",
);
expect(account.includes('to: "/student/vouchers"') && !account.includes('to: "/student/progress"') && !account.includes("Catatan tutor\", description"), "halaman Saya harus berfokus pada akun/voucher, bukan menduplikasi navigasi Progress di sidebar");

expect(how.includes("IntersectionObserver") && how.includes("lg:sticky") && how.includes("Hasil belajar dicatat setiap sesi"), "landing harus menjelaskan laporan sesi dan mempertahankan animasi scroll empat langkah");
expect(how.includes("Materi yang dipelajari dan laporan tutor") && !how.includes("Mapel, Bab, mode, dan jadwal"), "Cara Kerja harus sesuai alur target belajar tanpa kewajiban memilih Bab");

expect(cheapController.includes("$progressScope") && cheapController.includes("whereHas('order', fn ($orders) => $orders->where('status', 'paid'))"), "scope progress Kelas Kelompok belum dibatasi untuk peserta terverifikasi");
expect(cheapService.includes("progress_status") && cheapService.includes("chapterProgressSummary") && cheapService.includes("snapshot subjects milik occurrence"), "Kelas Kelompok belum menyimpan progress bab per occurrence");
expect(cheapTeacherController.includes("updateProgress") && cheapTeacher.includes("Kirim Laporan Sesi") && cheapTeacher.includes("progress_status"), "tutor belum dapat mengirim laporan progress bab Kelas Kelompok");
expect(routes.includes("/cheap-classes/{cheapClass}/progress"), "route update progress Kelas Kelompok belum terdaftar");
expect(packageController.includes("'learning_chapters' => PackageChapterProgress::chapters") && studentController.includes("'package_subject_id'"), "API detail Paket Belajar belum membawa metadata progress/laporan yang dibutuhkan");
expect(cheapTest.includes("test_teacher_report_requires_admin_verification_before_student_progress_changes"), "regression test progress Kelas Kelompok terverifikasi admin belum ditambahkan");

if (failures.length) {
  console.error("Redesign Progress gagal:");
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log("Redesign Progress lulus: daftar per paket, detail progress per Bab, shortcut konsisten, landing animatif, dan pencatatan tutor tersedia.");
