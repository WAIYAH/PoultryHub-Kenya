import type { AuthService, Services } from "../contracts";
import { lazyService } from "../lazy";

// Each mock service (and the fixtures behind it) is a separate chunk, loaded on first use.

const loadAuth = () => import("./auth").then((m) => m.createMockAuthService());

/** `onSessionChange` must return its unsubscribe function synchronously, so it is wrapped by hand. */
function lazyAuthService(): AuthService {
  const service = lazyService<Omit<AuthService, "onSessionChange">>(loadAuth, {
    getSession: true,
    signIn: true,
    signUp: true,
    exchangeCode: true,
    signOut: true,
    requestPasswordReset: true,
    updatePassword: true,
  });
  return {
    ...service,
    onSessionChange(listener) {
      let unsubscribe: (() => void) | undefined;
      let active = true;
      void loadAuth().then((auth) => {
        if (active) unsubscribe = auth.onSessionChange(listener);
      });
      return () => {
        active = false;
        unsubscribe?.();
      };
    },
  };
}

export function createMockServices(): Services {
  return {
    catalog: lazyService(() => import("./catalog").then((m) => m.createMockCatalogService()), {
      listCategories: true,
      listProducts: true,
      getProduct: true,
      listRelated: true,
    }),
    content: lazyService(() => import("./content").then((m) => m.createMockContentService()), {
      getSettings: true,
      getHome: true,
      getAbout: true,
      listServices: true,
      listFaqs: true,
      listTestimonials: true,
      listPosts: true,
      getPost: true,
      listRelatedPosts: true,
      getPolicy: true,
    }),
    delivery: lazyService(() => import("./delivery").then((m) => m.createMockDeliveryService()), {
      listZones: true,
      listAreas: true,
      listPickupLocations: true,
    }),
    orders: lazyService(() => import("./orders").then((m) => m.createMockOrderService()), {
      quoteCart: true,
      placeOrder: true,
      getOrder: true,
      trackOrder: true,
      listMyOrders: true,
      cancelPendingOrder: true,
    }),
    payments: lazyService(() => import("./payments").then((m) => m.createMockPaymentService()), {
      startMpesaPayment: true,
      getPaymentStatus: true,
      submitPaybillReference: true,
      simulate: true,
    }),
    auth: lazyAuthService(),
    account: lazyService(() => import("./account").then((m) => m.createMockAccountService()), {
      getProfile: true,
      updateProfile: true,
      listAddresses: true,
      saveAddress: true,
      deleteAddress: true,
    }),
    contact: lazyService(() => import("./contact").then((m) => m.createMockContactService()), {
      submit: true,
    }),
    search: lazyService(() => import("./search").then((m) => m.createMockSearchService()), {
      search: true,
    }),
  };
}
