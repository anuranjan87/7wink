// lib/insertlist.tsx
import { ReactNode } from "react";

export type InsertItem = {
  title: string;
  code: string;
};
export const insertList: InsertItem[] = [
  { 
    title: "Enquiry", 
    code: `
<div id="modal_insert">
<button id="openModal2"
    class="fixed bottom-6 right-6 bg-blue-400 text-white px-7 py-2 rounded-md shadow-lg hover:bg-blue-700">
    Enquire
    
  </button>

  <!-- Modal -->
  <div id="modal2" class="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-xl shadow-lg w-full max-w-md p-6 relative">
      
      <!-- Form -->
      <form id="enquiryForm" class="space-y-4">
        <div>
          <label for="email" class="block text-sm font-medium text-gray-700">Email ID</label>
          <input type="email" id="email" name="email" required
            class="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
        </div>

        <div>
          <label for="message" class="block text-sm font-medium text-gray-700">Your Message</label>
          <textarea id="message" name="your_message" rows="4" required
            class="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"></textarea>
        </div>

        <div class="flex justify-end gap-2 pt-2">
          <button type="button" id="closeModal2" class="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300">Close</button>
          <button type="submit" class="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700">Send</button>
        </div>
      </form>

      <!-- Success Message -->
      <div id="successMessage" class="hidden text-center py-6">
        <h2 class="text-xl font-semibold text-green-600">✅ Message Sent Successfully!</h2>
        <p class="text-gray-600 mt-2">We’ll get back to you shortly.</p>
        <button id="closeSuccess" class="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          Close
        </button>
      </div>
    </div>
  </div>
</div>
<script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
<script>
  (function() {
    const openBtn = document.getElementById("openModal2");
    const modal = document.getElementById("modal2");
    const closeBtn = document.getElementById("closeModal2");
    const closeSuccessBtn = document.getElementById("closeSuccess");
    const form = document.getElementById("enquiryForm");
    const successMessage = document.getElementById("successMessage");

    if (openBtn && modal) {
      openBtn.addEventListener("click", () => {
        modal.classList.remove("hidden");
        if(form) form.classList.remove("hidden");
        if(successMessage) successMessage.classList.add("hidden");
      });
    }

    if (closeBtn && modal) {
      closeBtn.addEventListener("click", () => {
        modal.classList.add("hidden");
      });
    }

    if (closeSuccessBtn && modal) {
      closeSuccessBtn.addEventListener("click", () => {
        modal.classList.add("hidden");
        if(successMessage) successMessage.classList.add("hidden");
      });
    }

    if (form && successMessage) {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        form.classList.add("hidden");
        successMessage.classList.remove("hidden");
      });
    }
  })();
</script>
` 
  },
  { title: "Appointment", code: `<div id="modal_insert">
<button id="openModal2"
    class="fixed bottom-6 right-6 bg-blue-400 text-white px-7 py-2 rounded-md shadow-lg hover:bg-blue-700">
    
    Appointment
  </button>

  <!-- Modal -->
  <div id="modal2" class="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-xl shadow-lg w-full max-w-md p-6 relative">
      
      <!-- Form -->
      <form id="enquiryForm" class="space-y-4">
        <div>
          <label for="email" class="block text-sm font-medium text-gray-700">Email ID</label>
          <input type="email" id="email" name="email" required
            class="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
        </div>

        <div>
          <label for="message" class="block text-sm font-medium text-gray-700">Your Message</label>
          <textarea id="message" name="your_message" rows="4" required
            class="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"></textarea>
        </div>

        <div class="flex justify-end gap-2 pt-2">
          <button type="button" id="closeModal2" class="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300">Close</button>
          <button type="submit" class="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700">Send</button>
        </div>
      </form>

      <!-- Success Message -->
      <div id="successMessage" class="hidden text-center py-6">
        <h2 class="text-xl font-semibold text-green-600">✅ Message Sent Successfully!</h2>
        <p class="text-gray-600 mt-2">We’ll get back to you shortly.</p>
        <button id="closeSuccess" class="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          Close
        </button>
      </div>
    </div>
  </div>
</div>
<script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
<script>
  (function() {
    const openBtn = document.getElementById("openModal2");
    const modal = document.getElementById("modal2");
    const closeBtn = document.getElementById("closeModal2");
    const closeSuccessBtn = document.getElementById("closeSuccess");
    const form = document.getElementById("enquiryForm");
    const successMessage = document.getElementById("successMessage");

    if (openBtn && modal) {
      openBtn.addEventListener("click", () => {
        modal.classList.remove("hidden");
        if(form) form.classList.remove("hidden");
        if(successMessage) successMessage.classList.add("hidden");
      });
    }

    if (closeBtn && modal) {
      closeBtn.addEventListener("click", () => {
        modal.classList.add("hidden");
      });
    }

    if (closeSuccessBtn && modal) {
      closeSuccessBtn.addEventListener("click", () => {
        modal.classList.add("hidden");
        if(successMessage) successMessage.classList.add("hidden");
      });
    }

    if (form && successMessage) {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        form.classList.add("hidden");
        successMessage.classList.remove("hidden");
      });
    }
  })();
</script>` },
  { title: "Feedback", code: `<div id="modal_insert">
  <button id="openModal2"
    class="fixed bottom-6 right-6 bg-blue-400 text-white px-7 py-2 rounded-md shadow-lg hover:bg-blue-700">
    Feedback
  </button>

  <!-- Modal -->
  <div id="modal2" class="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-xl shadow-lg w-full max-w-md p-6 relative">
      
      <!-- Form -->
      <form id="enquiryForm" class="space-y-4">
        <div>
          <label for="email" class="block text-sm font-medium text-gray-700">Email ID</label>
          <input type="email" id="email" name="email" required
            class="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
        </div>

        <div>
          <label for="message" class="block text-sm font-medium text-gray-700">Your Message</label>
          <textarea id="message" name="your_message" rows="4" required
            class="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"></textarea>
        </div>

        <div class="flex justify-end gap-2 pt-2">
          <button type="button" id="closeModal2" class="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300">Close</button>
          <button type="submit" class="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700">Send</button>
        </div>
      </form>

      <!-- Success Message -->
      <div id="successMessage" class="hidden text-center py-6">
        <h2 class="text-xl font-semibold text-green-600">✅ Message Sent Successfully!</h2>
        <p class="text-gray-600 mt-2">We’ll get back to you shortly.</p>
        <button id="closeSuccess" class="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          Close
        </button>
      </div>
    </div>
  </div>
</div>
<script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
<script>
  (function() {
    const openBtn = document.getElementById("openModal2");
    const modal = document.getElementById("modal2");
    const closeBtn = document.getElementById("closeModal2");
    const closeSuccessBtn = document.getElementById("closeSuccess");
    const form = document.getElementById("enquiryForm");
    const successMessage = document.getElementById("successMessage");

    if (openBtn && modal) {
      openBtn.addEventListener("click", () => {
        modal.classList.remove("hidden");
        if(form) form.classList.remove("hidden");
        if(successMessage) successMessage.classList.add("hidden");
      });
    }

    if (closeBtn && modal) {
      closeBtn.addEventListener("click", () => {
        modal.classList.add("hidden");
      });
    }

    if (closeSuccessBtn && modal) {
      closeSuccessBtn.addEventListener("click", () => {
        modal.classList.add("hidden");
        if(successMessage) successMessage.classList.add("hidden");
      });
    }

    if (form && successMessage) {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        form.classList.add("hidden");
        successMessage.classList.remove("hidden");
      });
    }
  })();
</script>` }, 
 

];
