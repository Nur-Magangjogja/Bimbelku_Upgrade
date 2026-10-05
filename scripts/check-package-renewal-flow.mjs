import fs from "node:fs";

const commandFile = "bimbelku-backend/app/Console/Commands/DemoPackageRenewal.php";
const controllerFile = "bimbelku-backend/app/Http/Controllers/Api/StudentPackageController.php";
const builderFile = "src/pages/students/PackageBuilder.tsx";
const packagesFile = "src/pages/students/MyPackages.tsx";
const testFile = "bimbelku-backend/tests/Feature/DemoPackageRenewalCommandTest.php";
const checkoutFile = "bimbelku-backend/app/Services/PackageCheckoutService.php";

const command = fs.readFileSync(commandFile, "utf8");
const controller = fs.readFileSync(controllerFile, "utf8");
const builder = fs.readFileSync(builderFile, "utf8");
const packages = fs.readFileSync(packagesFile, "utf8");
const test = fs.readFileSync(testFile, "utf8");
const checkout = fs.readFileSync(checkoutFile, "utf8");

const checks = [];
const add = (label, ok) => checks.push([label, Boolean(ok)]);

add("renewal demo command exists", command.includes("demo:package-renewal"));
add("renewal demo is local/testing only", command.includes("environment(['local', 'testing'])"));
add("completed package can renew immediately", controller.includes("if ($package->status === 'completed')") && controller.includes("return true;"));
add("active package still keeps H-7 renewal rule", controller.includes("$package->status === 'active'") && controller.includes("subDays(7)"));
add("new package uses configurable 24 hour booking lead", controller.includes("where('key', 'booking_lead_hours')") && controller.includes("?? 24") && controller.includes("'Jadwal paket paling cepat dimulai '.$bookingLeadHours.' jam dari sekarang.'"));
add("same-tutor renewal uses configurable 12 hour lead", controller.includes("renewalUsesSameTutors") && controller.includes("where('key', 'renewal_booking_lead_hours')") && controller.includes("?? 12"));
add("renewal without old tutor stays on 24 hours", test.includes("demo-renewal-without-old-tutor") && test.includes("Jadwal paket paling cepat dimulai 24 jam dari sekarang."));
add("renewal test proves a schedule under 24 hours can pass with old tutor", test.includes("collect([0, 2, 7, 9])") && test.includes("preferred_teacher_id") && test.includes("assertCreated()"));
add("renewal builder reads both lead times from backend", builder.includes("bookingRules.renewal_booking_lead_hours") && builder.includes("bookingRules.booking_lead_hours"));
add("builder no longer hardcodes a 96 hour date minimum", !builder.includes("Date.now() + 96 * 60 * 60 * 1000"));
add("renewal chain cannot branch from the same source package", controller.includes("hasBlockingRenewal") && controller.includes("sudah memiliki paket lanjutan") && test.includes("assertJsonPath('can_renew', false)"));
add("renewed chapter progress starts fresh", controller.includes("'status' => 'not_started'") && controller.includes("'started_at' => null") && controller.includes("'completed_at' => null"));
add("reselected completed chapter is marked as reinforcement", controller.includes("$wasCompletedBefore") && controller.includes("'needs_review' => $wasCompletedBefore"));
add("renewal converts previous chapters to editable text before optional reselection", builder.includes('learning_goal: item.learning_goal || item.chapter || ""') && builder.includes('focus_mode: "text"') && builder.includes("curriculum_chapter_ids: []"));
add("renewal guides student to update learning focus", builder.includes("Perbarui target belajar bila perlu") && builder.includes("<LearningFocusPicker"));
add("renewal retains previous focus or legacy material description", builder.includes('learning_goal: item.learning_goal || item.chapter || ""'));
add("same-tutor renewal locks the selected subject", builder.includes("disabled={Boolean(renewalId && renewalSubjectId)}"));
add("renewal package is visibly labelled in Kelas Saya", packages.includes("Paket lanjutan") && controller.includes("'renewal_of_id'"));
add("demo setup provides a 100 percent completed source package", command.includes("materi lama 100%") && command.includes("'status' => 'completed'"));
add("demo payment uses production PackageCheckoutService", command.includes("activatePaidPackage"));
add("preferred tutor matching increments attempts with an integer-safe locked update", checkout.includes("'matching_attempts' => (int) $lockedRequest->matching_attempts + 1") && !checkout.includes("'matching_attempts' => DB::raw('matching_attempts + 1')"));
add("demo requires tutor to accept real renewal offer", command.includes("Permintaan Bimbel") && command.includes("Tutor lama harus menerima"));
add("demo can fast-forward to final renewal session", command.includes("final-session-ready") && command.includes("Pertemuan sebelumnya dianggap selesai hanya untuk demo lokal"));
add("demo checkout always targets highest renewal session sequence", command.includes("orderByDesc('sequence')") && command.includes("whereNotNull('booking_id')"));
add("demo keeps normal final private-session workflow", (command.includes("Murid buat PIN") && command.includes("Selesaikan Sesi + foto")) || (command.includes("Session Flow V2") && command.includes("Saya Siap Mengajar") && command.includes("Saya Sudah Hadir")));
add("feature test creates renewal through real student package API", test.includes("/api/student/packages") && test.includes("renewal_of_id"));
add("feature test proves completed old material is not inherited as completed", test.includes("every(fn ($topic) => $topic->status === 'not_started')"));
add("feature test covers real tutor offer acceptance", test.includes("/api/teacher/offers/") && test.includes("/accept"));
add("feature test reaches second package final Session Flow", test.includes("student_generate_pin") || (test.includes("teacher_mark_ready") && test.includes("student_confirm_presence")));

let failed = 0;
for (const [label, ok] of checks) {
  console.log(`${ok ? "PASS" : "FAIL"}  ${label}`);
  if (!ok) failed += 1;
}
if (failed) process.exit(1);
console.log(`\n${checks.length}/${checks.length} Package Renewal checks PASS`);
