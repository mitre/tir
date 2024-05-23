<script setup>
import { Dialog, DialogPanel, DialogTitle, TransitionChild, TransitionRoot } from "@headlessui/vue";
import LoginFailed from "./LoginFailed.vue";

const props = defineProps({
  authMethod: {
    type: String,
    required: true,
    validator(val) {
      return ["Local", "LDAP"].includes(val);
    },
  },
});

const open = ref(false);

const userInput = ref({
  username: "",
  passwordField: "",
  agree: false,
});

const dialogOpen = ref(false);

const isAuthenticated = useCookie("is-authenticated");
const currentUser = useCookie("current-user");

const router = useRouter();

async function loginUser() {
  console.log("Starting Login: ", props.authMethod);
  console.log(userInput.value.username.toLowerCase());
  if (
    userInput.value.username.length > 0 &&
    userInput.value.passwordField.length > 0 &&
    userInput.value.agree === true
  ) {
    console.log("Login: Fields filled");
    try {
      console.log("Calling login api");
      let apiError = null;

      if (props.authMethod === "Local") {
        const { error } = await useFetch("/api/auth/login/local", {
          method: "POST",
          body: {
            email: userInput.value.username.toLowerCase(),
            password: userInput.value.passwordField,
          },
        });
        apiError = error;
      } else if (props.authMethod === "LDAP") {
        const { error } = await useFetch("/api/auth/login/ldap", {
          method: "POST",
          body: {
            username: userInput.value.username.toLowerCase(),
            password: userInput.value.passwordField,
          },
        });
        apiError = error;
      } else {
        throw createError({ statusCode: 500, statusMessage: "Unsupported authentication method" });
      }

      if (apiError && apiError.value) {
        console.log("Login error:", apiError);
        dialogOpen.value = true;
      } else {
        console.log("Login successful");

        isAuthenticated.value = "true";
        currentUser.value = userInput.value.username;

        router.push("/home");
      }
    } catch (error) {
      console.log("Login error caught:", error);
    }
  }
}
</script>

<template>
  <form class="space-y-6" @submit.prevent>
    <div>
      <label for="username" class="block text-sm font-medium leading-6 text-gray-800 dark:text-white"> Username </label>
      <div class="mt-2">
        <input
          id="text"
          v-model="userInput.username"
          name="text"
          type="text"
          autocomplete="text"
          required
          class="block w-full rounded-md border-0 bg-white py-1.5 text-black shadow-sm ring-1 ring-inset ring-black/20 focus:ring-2 focus:ring-inset focus:ring-indigo-500 dark:bg-white/5 dark:text-white dark:ring-white/10 sm:text-sm sm:leading-6"
        />
      </div>
    </div>

    <div>
      <div class="flex items-center justify-between">
        <label for="password" class="block text-sm font-medium leading-6 text-gray-800 dark:text-white">Password</label>
      </div>
      <div class="mt-2">
        <input
          id="password"
          v-model="userInput.passwordField"
          name="password"
          type="password"
          autocomplete="current-password"
          required
          class="block w-full rounded-md border-0 bg-white py-1.5 text-black shadow-sm ring-1 ring-inset ring-black/20 focus:ring-2 focus:ring-inset focus:ring-indigo-500 dark:bg-white/5 dark:text-white dark:ring-white/10 sm:text-sm sm:leading-6"
        />
      </div>
    </div>
    <fieldset>
      <div class="space-y-5">
        <div class="relative flex items-start">
          <div class="flex h-6 items-center">
            <input
              id="comments"
              v-model="userInput.agree"
              aria-describedby="comments-description"
              required
              name="comments"
              type="checkbox"
              class="h-4 w-4 cursor-pointer rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
            />
          </div>
          <div class="ml-3 text-sm leading-6">
            <label for="comments" class="font-medium text-gray-500">
              I agree to the terms of the
              <a
                class="cursor-pointer font-semibold leading-6 text-indigo-400 hover:text-indigo-300"
                @click="open = true"
                >IS User Agreement</a
              >
            </label>
          </div>
        </div>
      </div>
    </fieldset>
    <!-- Consent Banner --->
    <TransitionRoot as="template" :show="open">
      <Dialog as="div" class="relative z-10" @close="open = false">
        <TransitionChild
          as="template"
          enter="ease-out duration-300"
          enter-from="opacity-0"
          enter-to="opacity-100"
          leave="ease-in duration-200"
          leave-from="opacity-100"
          leave-to="opacity-0"
        >
          <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </TransitionChild>
        <div class="fixed inset-0 z-10 overflow-y-auto">
          <div class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <TransitionChild
              as="template"
              enter="ease-out duration-300"
              enter-from="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enter-to="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leave-from="opacity-100 translate-y-0 sm:scale-100"
              leave-to="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <DialogPanel
                class="relative transform overflow-hidden rounded-lg bg-gray-100 px-4 pb-4 pt-5 text-left shadow-xl transition-all dark:bg-gray-900 sm:my-8 sm:w-full sm:max-w-xl sm:p-6"
              >
                <div>
                  <div class="text-center">
                    <DialogTitle as="h3" class="text-base font-semibold leading-6 text-black dark:text-white"
                      >Consent To Monitor
                    </DialogTitle>
                    <div class="mt-2">
                      <p class="text-sm text-gray-600 dark:text-white">
                        You are accessing a U.S. Government (USG) Information System (IS) that is provided for
                        USG-authorized use only. By using this IS (which includes any device attached to this IS), you
                        consent to the following conditions:
                      </p>
                    </div>
                  </div>
                </div>
                <!-- Sign In Button -->
                <div class="mt-5 sm:mt-6">
                  <button
                    type="button"
                    class="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                    @click="open = false"
                  >
                    Go back to login
                  </button>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </TransitionRoot>
    <div>
      <button
        type="submit"
        class="flex w-full justify-center rounded-md bg-indigo-500 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
        @click="loginUser"
      >
        Sign in
      </button>
    </div>
    <LoginFailed :show="dialogOpen" :dialog-open="dialogOpen" @change="dialogOpen = false" />
  </form>
</template>
