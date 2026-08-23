/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { BrevoClient } from '@getbrevo/brevo';

export type MailTemplateType =
  'WELCOME' | 'OTP' | 'ACCOUNT_VALIDATION' | 'RESET_PASSWORD';

interface ISendMailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
  template?: MailTemplateType;
  context?: Record<string, any>;
}

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly brevo: BrevoClient;
  private readonly fromEmail: string;

  constructor() {
    const apiKey = process.env.BREVO_API_KEY;

    if (!apiKey) {
      throw new Error(
        "BREVO_API_KEY manquante dans les variables d'environnement",
      );
    }

    this.brevo = new BrevoClient({ apiKey });
    this.fromEmail = process.env.MAIL_FROM as string;
  }

  async send({
    to,
    subject,
    text,
    html,
    template,
    context = {},
  }: ISendMailOptions): Promise<boolean> {
    try {
      const finalHtml = template
        ? this.compileTemplate(template, context)
        : html;

      const result = await this.brevo.transactionalEmails.sendTransacEmail({
        sender: { name: 'IFO-TECH', email: this.fromEmail },
        to: [{ email: to }],
        subject,
        htmlContent: finalHtml,
        textContent: text,
      });

      this.logger.log(
        `[Brevo] Email envoyé à : ${to} (ID: ${(result as any)?.messageId})`,
      );
      return true;
    } catch (error: any) {
      this.logger.error(`[Brevo Error] Échec de l'envoi du mail à ${to}`);
      console.log('=== ERREUR BREVO ===', error);

      throw new InternalServerErrorException({
        message: "Échec technique de l'envoi d'e-mail via Brevo",
        errorDetails: error?.message || 'Erreur inconnue',
        code: error?.name || 'BREVO_ERROR',
      });
    }
  }

  private compileTemplate(
    template: MailTemplateType | undefined,
    context: Record<string, any>,
  ): string {
    const currentYear = new Date().getFullYear();

    // Layout réutilisable aux couleurs Bleu & Orange
    const baseLayout = (content: string) => `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>IFO-TECH</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #F8FAFC; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; -webkit-font-smoothing: antialiased;">
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #F8FAFC; padding: 40px 10px;">
          <tr>
            <td align="center">
              <!-- Conteneur Principal -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #FFFFFF; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);">
                
                <!-- HEADER: Dégradé Bleu Principal -> Orange Secondaire -->
                <tr>
                  <td align="center" style="background: linear-gradient(135deg, #1E40AF 0%, #2563EB 60%, #F97316 100%); padding: 40px 20px;">
                    <h1 style="margin: 0; color: #FFFFFF; font-size: 32px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase;">IFO-TECH</h1>
                    <p style="margin: 5px 0 0 0; color: #FFEDD5; font-size: 14px; font-weight: 500; letter-spacing: 1px;">Éclairez vos perspectives</p>
                  </td>
                </tr>

                <!-- CONTENU -->
                <tr>
                  <td style="padding: 40px 30px; color: #334155; font-size: 16px; line-height: 1.6;">
                    ${content}
                    
                    <div style="margin-top: 40px; border-top: 1px solid #E2E8F0; padding-top: 20px;">
                      <p style="font-size: 14px; color: #64748B; margin: 0;">Cordialement,</p>
                      <p style="font-size: 16px; font-weight: 700; color: #F97316; margin: 4px 0 0 0;">L'équipe IFO-TECH</p>
                    </div>
                  </td>
                </tr>

                <!-- FOOTER PROFESSIONNEL -->
                <tr>
                  <td align="center" style="background-color: #F1F5F9; padding: 30px 20px; border-top: 1px solid #E2E8F0;">
                    <p style="margin: 0; font-size: 13px; font-weight: 600; color: #1E40AF;">IFO-TECH Inc.</p>
                    <p style="margin: 6px 0 0 0; font-size: 12px; color: #94A3B8; line-height: 1.4;">
                      Vous recevez cet e-mail suite à votre activité sur notre plateforme.<br>
                      Pour garantir la réception de nos messages, ajoutez notre adresse à vos contacts.
                    </p>
                    <p style="margin: 15px 0 0 0; font-size: 12px; color: #94A3B8;">
                      <a href="#" style="color: #2563EB; text-decoration: none; font-weight: 500;">Centre d'aide</a> &nbsp;•&nbsp; 
                      <a href="#" style="color: #2563EB; text-decoration: none; font-weight: 500;">Politique de confidentialité</a> &nbsp;•&nbsp; 
                      <a href="#" style="color: #64748B; text-decoration: underline;">Se désabonner</a>
                    </p>
                    <p style="margin: 20px 0 0 0; font-size: 11px; color: #94A3B8; letter-spacing: 0.5px;">
                      &copy; ${currentYear} IFO-TECH. Tous droits réservés.
                    </p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    switch (template) {
      case 'WELCOME':
        return baseLayout(`
          <h2 style="margin-top: 0; color: #1E40AF; font-size: 22px; font-weight: 700;">Ravis de vous compter parmi nous !</h2>
          <p>Bonjour <strong>${context.name || 'Utilisateur'}</strong>,</p>
          <p>Bienvenue sur <strong>IFO-TECH</strong>. Votre compte a été créé avec succès et vous êtes maintenant prêt à explorer l'intégralité de nos fonctionnalités de gestion et d'architecture distribuée.</p>
          <p>Profitez pleinement de votre expérience et n'hésitez pas à solliciter notre support en cas de besoin.</p>
        `);
      case 'OTP':
        return baseLayout(`
          <h2 style="margin-top: 0; color: #1E40AF; font-size: 22px; font-weight: 700;">Code de vérification</h2>
          <p>Bonjour,</p>
          <p>Pour sécuriser votre accès, veuillez utiliser le code de validation à usage unique (OTP) ci-dessous :</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <div style="display: inline-block; background: #FFF7ED; border: 2px dashed #F97316; padding: 18px 40px; text-align: center; font-size: 28px; font-weight: 800; letter-spacing: 6px; color: #1E40AF; border-radius: 12px;">
              ${context.otp || '000000'}
            </div>
          </div>
          
          <p style="font-size: 13px; color: #64748B; background-color: #EFF6FF; padding: 12px; border-left: 4px solid #2563EB; border-radius: 4px;">
            <strong>Attention :</strong> Ce code est strictly confidentiel. Il expirera automatiquement dans quelques minutes. Si vous n'êtes pas à l'origine de cette demande, ignorez cet e-mail.
          </p>
        `);
      case 'ACCOUNT_VALIDATION':
        return baseLayout(`
          <h2 style="margin-top: 0; color: #1E40AF; font-size: 22px; font-weight: 700;">Activez votre compte</h2>
          <p>Bonjour <strong>${context.name || 'Utilisateur'}</strong>,</p>
          <p>Merci pour votre confiance ! Une dernière étape est requise pour finaliser la configuration de votre profil IFO-TECH. Veuillez confirmer votre adresse e-mail en cliquant sur le bouton ci-dessous :</p>
          
          <div style="text-align: center; margin: 35px 0;">
            <a href="${context.url || '#'}" style="background: linear-gradient(135deg, #1E40AF 0%, #2563EB 100%); color: #FFFFFF; padding: 14px 32px; text-decoration: none; font-weight: 700; font-size: 15px; border-radius: 8px; display: inline-block; box-shadow: 0 4px 10px rgba(37, 99, 235, 0.3);">
              Valider mon adresse e-mail
            </a>
          </div>
          
          <p style="font-size: 13px; color: #94A3B8; text-align: center; margin-top: 25px;">
            Si le bouton ne fonctionne pas, copiez-collez ce lien dans votre navigateur :<br>
            <a href="${context.url || '#'}" style="color: #F97316; word-break: break-all;">${context.url || '#'}</a>
          </p>
        `);
      case 'RESET_PASSWORD':
        return baseLayout(`
          <h2 style="margin-top: 0; color: #1E40AF; font-size: 22px; font-weight: 700;">Réinitialisation de votre mot de passe</h2>
          <p>Bonjour,</p>
          <p>Nous avons reçu une demande de réinitialisation de mot de passe pour votre compte IFO-TECH.</p>
          <p>Pour configurer un nouveau mot de passe, cliquez simplement sur le bouton ci-dessous. Attention, ce lien est unique et expirera dans 15 minutes :</p>
          
          <div style="text-align: center; margin: 35px 0;">
            <a href="${context.url || '#'}" style="background: linear-gradient(135deg, #1E40AF 0%, #2563EB 100%); color: #FFFFFF; padding: 14px 32px; text-decoration: none; font-weight: 700; font-size: 15px; border-radius: 8px; display: inline-block; box-shadow: 0 4px 10px rgba(37, 99, 235, 0.3);">
              Réinitialiser mon mot de passe
            </a>
          </div>
          
          <p style="font-size: 13px; color: #94A3B8; text-align: center; margin-top: 25px;">
            Si le bouton ne fonctionne pas, copiez-collez ce lien dans votre navigateur :<br>
            <a href="${context.url || '#'}" style="color: #F97316; word-break: break-all;">${context.url || '#'}</a>
          </p>

          <p style="font-size: 12px; color: #64748B; background-color: #EFF6FF; padding: 12px; border-left: 4px solid #2563EB; border-radius: 4px; margin-top: 20px;">
            <strong>Note :</strong> Si vous n'êtes pas à l'origine de cette demande, ignorez cet e-mail. Votre mot de passe actuel restera inchangé.
          </p>
        `);

      default:
        return baseLayout(`<p>${context.message || ''}</p>`);
    }
  }
}
