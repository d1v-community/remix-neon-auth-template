import {
	type ActionFunctionArgs,
	json,
	type LoaderFunctionArgs,
	type MetaFunction,
	redirect,
} from "@remix-run/node";
import { Form, Link, useLoaderData, useNavigation } from "@remix-run/react";
import { AppFooter } from "~/components/AppFooter";
import { AppHeader } from "~/components/AppHeader";
import { APP_TITLE } from "~/constants/app";
import {
	createPaymentHubPaymentLink,
	listPaymentHubProducts,
	type PaymentHubApiError,
	type PaymentHubConfigError,
	type PaymentHubProduct,
	type PaymentHubProductPrice,
	toPaymentHubUserId,
} from "~/services/payment.server";
import { getUserFromRequest, requireUser } from "~/utils/auth.server";
import {
	getEnvWarningMessage,
	getPaymentCancelUrl,
	getPaymentHubConfigWarningMessage,
	getPaymentSuccessUrl,
} from "~/utils/env.server";

export const meta: MetaFunction = () => {
	return [
		{ title: `Pricing - ${APP_TITLE}` },
		{
			name: "description",
			content: "Browse products and start a checkout flow with Payment Hub.",
		},
	];
};

export async function loader({ request }: LoaderFunctionArgs) {
	const user = await getUserFromRequest(request);
	const envWarning = getEnvWarningMessage();
	const paymentWarning = getPaymentHubConfigWarningMessage();

	try {
		const products = await listPaymentHubProducts();

		return json({
			user,
			products,
			envWarning,
			paymentWarning,
			loadError: null,
		});
	} catch (error) {
		const message =
			error instanceof Error
				? error.message
				: "Failed to load products from Payment Hub.";

		return json({
			user,
			products: [] as PaymentHubProduct[],
			envWarning,
			paymentWarning,
			loadError: message,
		});
	}
}

export async function action({ request }: ActionFunctionArgs) {
	const user = await requireUser(request);
	const formData = await request.formData();

	const productId = String(formData.get("productId") ?? "").trim();

	if (!productId) {
		return json(
			{ success: false, error: "Missing product id." },
			{ status: 400 },
		);
	}

	try {
		const paymentLink = await createPaymentHubPaymentLink({
			productId,
			userId: toPaymentHubUserId(user.id),
			buyerEmail: user.email ?? undefined,
			successUrl: getPaymentSuccessUrl(),
			cancelUrl: getPaymentCancelUrl(),
			requireBuyerEmail: true,
			requireBuyerName: false,
		});

		if (!paymentLink.url) {
			return json(
				{ success: false, error: "Payment Hub did not return a checkout url." },
				{ status: 502 },
			);
		}

		return redirect(paymentLink.url);
	} catch (error) {
		const message =
			error instanceof Error ? error.message : "Failed to create payment link.";

		const status =
			typeof error === "object" &&
			error !== null &&
			"status" in error &&
			typeof (
				error as
					| PaymentHubApiError
					| (PaymentHubConfigError & { status?: unknown })
			).status === "number"
				? Number(
						(
							error as
								| PaymentHubApiError
								| (PaymentHubConfigError & { status: number })
						).status,
					)
				: 500;

		return json({ success: false, error: message }, { status });
	}
}

function formatAmount(price?: PaymentHubProductPrice | null) {
	if (!price?.amount) return "Contact sales";

	const amount = Number(price.amount);
	if (Number.isNaN(amount)) {
		return `${price.amount} ${String(price.currency ?? "").toUpperCase()}`.trim();
	}

	try {
		return new Intl.NumberFormat("en-US", {
			style: "currency",
			currency: (price.currency || "USD").toUpperCase(),
		}).format(amount);
	} catch {
		return `${amount.toFixed(2)} ${(price.currency || "USD").toUpperCase()}`;
	}
}

function formatBilling(price?: PaymentHubProductPrice | null) {
	if (!price) return "Custom pricing";

	if (price.type === "recurring" && price.interval) {
		return `Billed every ${price.interval}`;
	}

	if (price.type === "one_time") {
		return "One-time payment";
	}

	return "Flexible billing";
}

function getProductPrice(product: PaymentHubProduct) {
	return product.price ?? product.prices?.[0] ?? null;
}

function ProductCard({
	product,
	isLoggedIn,
	isSubmitting,
}: {
	product: PaymentHubProduct;
	isLoggedIn: boolean;
	isSubmitting: boolean;
}) {
	const price = getProductPrice(product);

	return (
		<div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
			<div className="space-y-3">
				<div className="flex items-start justify-between gap-3">
					<div>
						<h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
							{product.name}
						</h2>
						<p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
							{product.description || "Ready to use with the Payment Hub API."}
						</p>
					</div>

					{product.active === false ? (
						<span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
							Inactive
						</span>
					) : (
						<span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
							Active
						</span>
					)}
				</div>

				<div className="rounded-xl bg-slate-50 px-4 py-4 dark:bg-slate-800/60">
					<div className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
						{formatAmount(price)}
					</div>
					<div className="mt-1 text-sm text-slate-600 dark:text-slate-400">
						{formatBilling(price)}
					</div>
				</div>

				<div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
					<div className="flex items-center justify-between gap-4">
						<span>Product ID</span>
						<code className="max-w-[16rem] truncate rounded bg-slate-100 px-2 py-1 text-xs text-slate-700 dark:bg-slate-800 dark:text-slate-300">
							{product.id}
						</code>
					</div>

					{price?.currency ? (
						<div className="flex items-center justify-between gap-4">
							<span>Currency</span>
							<span className="font-medium uppercase text-slate-800 dark:text-slate-200">
								{price.currency}
							</span>
						</div>
					) : null}
				</div>
			</div>

			<div className="mt-6">
				{isLoggedIn ? (
					<Form method="post">
						<input type="hidden" name="productId" value={product.id} />
						<button
							type="submit"
							disabled={isSubmitting || product.active === false}
							className="inline-flex w-full items-center justify-center rounded-xl bg-blue-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-sky-500 dark:hover:bg-sky-600 dark:focus:ring-sky-900"
						>
							{isSubmitting ? "Creating checkout..." : "Buy now"}
						</button>
					</Form>
				) : (
					<Link
						to="/login"
						className="inline-flex w-full items-center justify-center rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
					>
						Login to continue
					</Link>
				)}
			</div>
		</div>
	);
}

export default function PricingPage() {
	const { user, products, envWarning, paymentWarning, loadError } =
		useLoaderData<typeof loader>();
	const navigation = useNavigation();
	const isSubmitting = navigation.state === "submitting";

	const handleLogout = async () => {
		try {
			await fetch("/api/auth/logout", { method: "POST" });
		} finally {
			try {
				localStorage.removeItem("auth-token");
			} catch {
				// noop
			}
			window.location.href = "/login";
		}
	};

	return (
		<div className="min-h-screen bg-slate-50 dark:bg-slate-950">
			{envWarning ? (
				<div className="w-full border-b border-red-200 bg-red-50 px-4 py-2 text-center text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
					{envWarning}
				</div>
			) : null}

			{paymentWarning ? (
				<div className="w-full border-b border-amber-200 bg-amber-50 px-4 py-2 text-center text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
					{paymentWarning}
				</div>
			) : null}

			<AppHeader user={user} onLogout={handleLogout} />

			<main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
				<section className="mx-auto max-w-3xl text-center">
					<div className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 dark:border-sky-900 dark:bg-sky-950/40 dark:text-sky-300">
						Payment Hub Demo
					</div>
					<h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-900 dark:text-slate-50 sm:text-5xl">
						Choose a plan and start checkout in one click
					</h1>
					<p className="mt-4 text-base leading-7 text-slate-600 dark:text-slate-400 sm:text-lg">
						This page reads products from your Payment Hub account and creates a
						secure checkout link for the current logged-in user.
					</p>

					<div className="mt-6 flex flex-wrap items-center justify-center gap-3">
						<Link
							to="/"
							className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
						>
							Back to home
						</Link>
						{user ? (
							<span className="rounded-xl bg-emerald-50 px-4 py-2.5 text-sm font-medium text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
								Logged in as {user.displayName || user.username || user.email}
							</span>
						) : (
							<Link
								to="/login"
								className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 dark:bg-sky-500 dark:hover:bg-sky-600"
							>
								Login to purchase
							</Link>
						)}
					</div>
				</section>

				{loadError ? (
					<section className="mx-auto mt-10 max-w-3xl rounded-2xl border border-red-200 bg-white p-6 text-left shadow-sm dark:border-red-900 dark:bg-slate-900">
						<h2 className="text-lg font-semibold text-red-700 dark:text-red-300">
							Unable to load products
						</h2>
						<p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
							{loadError}
						</p>
						<p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
							Check your Payment Hub API token and make sure your account
							already has at least one active product.
						</p>
					</section>
				) : null}

				<section className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
					{products.map((product) => (
						<ProductCard
							key={product.id}
							product={product}
							isLoggedIn={Boolean(user)}
							isSubmitting={isSubmitting}
						/>
					))}
				</section>

				{!loadError && products.length === 0 ? (
					<section className="mx-auto mt-10 max-w-3xl rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
						<h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
							No products found
						</h2>
						<p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-400">
							Create products first in Payment Hub, then refresh this page. Once
							products are available, this route can immediately act as your
							pricing and checkout entry page.
						</p>
					</section>
				) : null}
			</main>

			<AppFooter />
		</div>
	);
}
