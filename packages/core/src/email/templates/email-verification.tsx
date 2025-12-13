import {
	Body,
	Column,
	Container,
	Head,
	Heading,
	Html,
	Preview,
	Row,
	Section,
	Text,
} from "@react-email/components";
import type { CSSProperties } from "react";

const brandData = {
	name: "Scribe",
	primaryColor: "#0066FF",
	websiteUrl: "https://github.com/blackmamoth",
	logoUrl: null, // No logo URL provided
};

interface EmailProps {
	recipientName?: string;
	otpCode?: string;
	expiryMinutes?: number;
}

export function EmailVerification({
	recipientName = "there",
	otpCode = "123456",
	expiryMinutes = 5,
}: EmailProps) {
	return (
		<Html>
			<Head>
				<Preview>Your OTP Verification Code</Preview>
			</Head>
			<Body style={main}>
				<Container style={container}>
					<Section style={headerSection}>
						<Row>
							<Column align="center">
								<Heading style={titleStyle}>Verify Your Email</Heading>
								<Text style={subtitleStyle}>
									Hi {recipientName}, use the code below to complete your
									verification:
								</Text>
							</Column>
						</Row>
					</Section>

					<Section style={otpSection}>
						<Row>
							<Column align="center">
								<div style={otpDisplay}>
									<Text style={otpLabel}>Your OTP Code</Text>
									<Text style={otpCodeStyle}>{otpCode}</Text>
									<Text style={expiryText}>
										This code expires in {expiryMinutes} minutes
									</Text>
								</div>
							</Column>
						</Row>
					</Section>

					<Section style={footerSection}>
						<Row>
							<Column align="center">
								<Text style={footerText}>
									If you did not request this, please ignore this email.
								</Text>
								<Text style={supportText}>
									Need help?{" "}
									<a
										href={`${brandData.websiteUrl}/support`}
										style={footerLink}
									>
										Contact Support
									</a>
								</Text>
							</Column>
						</Row>
					</Section>
				</Container>
			</Body>
		</Html>
	);
}

const main: CSSProperties = {
	fontFamily:
		'-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
	lineHeight: "1.5",
};

const container: CSSProperties = {
	maxWidth: "600px",
	margin: "0 auto",
	padding: "24px",
	background: "#ffffff",
	borderRadius: "8px",
	boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
};

const headerSection: CSSProperties = {
	padding: "24px 0",
};

const titleStyle: CSSProperties = {
	fontSize: "24px",
	fontWeight: "700",
	color: brandData.primaryColor,
	textAlign: "center",
};

const subtitleStyle: CSSProperties = {
	fontSize: "16px",
	color: "#333333",
	textAlign: "center",
};

const otpSection: CSSProperties = {
	padding: "16px 0",
	textAlign: "center",
};

const otpDisplay: CSSProperties = {
	margin: "auto",
	background: "#f9f9f9",
	borderRadius: "12px",
	padding: "24px",
	boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
};

const otpLabel: CSSProperties = {
	fontSize: "14px",
	color: "#555555",
};

const otpCodeStyle: CSSProperties = {
	fontSize: "32px",
	fontWeight: "bold",
	color: brandData.primaryColor,
};

const expiryText: CSSProperties = {
	fontSize: "12px",
	color: "#777777",
	marginTop: "8px",
};

const footerSection: CSSProperties = {
	padding: "24px 0",
};

const footerText: CSSProperties = {
	fontSize: "14px",
	color: "#555555",
	textAlign: "center",
};

const supportText: CSSProperties = {
	fontSize: "14px",
	color: "#555555",
	textAlign: "center",
};

const footerLink: CSSProperties = {
	color: brandData.primaryColor,
	textDecoration: "underline",
};
