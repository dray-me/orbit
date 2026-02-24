const { createCanvas } = require('canvas');
const { AttachmentBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } = require('discord.js');
const moment = require('moment');

module.exports = {
  name: 'invoice',
  description: 'Generate and manage invoices with interactive controls',
  category: 'Utility',
  aliases: ['bill', 'inv'],
  usage: 'invoice create <item> <amount> | invoice preview | invoice help',

  async execute(message, args) {
    const sub = args[0]?.toLowerCase();

    if (!sub) {
      return showInvoiceHelp(message);
    }

    switch (sub) {
      case 'help':
        return showInvoiceHelp(message);
      case 'preview':
        return showInvoicePreview(message);
      case 'create':
        return createInvoice(message, args.slice(1));
      case 'log':
        return showInvoiceLog(message);
      default:
        return message.reply('❌ Invalid subcommand. Use `invoice help` for guidance.');
    }
  }
};

// Show help embed with buttons
async function showInvoiceHelp(message) {
  const embed = new EmbedBuilder()
    .setTitle('🧾 Invoice Command Help')
    .setColor('#3498db')
    .setDescription('Manage your invoices with these commands:')
    .addFields(
      { name: '📝 Create Invoice', value: '`invoice create <item> <amount>`\nGenerate a new invoice' },
      { name: '👀 Preview', value: '`invoice preview`\nView a sample invoice' },
      { name: '📋 Logs', value: '`invoice log`\nView your invoice history' }
    )
    .setFooter({ text: 'Click buttons below for quick actions' });

  const row = new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('invoice_create')
        .setLabel('Create Invoice')
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId('invoice_preview')
        .setLabel('Preview')
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId('invoice_logs')
        .setLabel('View Logs')
        .setStyle(ButtonStyle.Success)
    );

  await message.reply({ embeds: [embed], components: [row] });
}

// Show invoice preview with download button
async function showInvoicePreview(message) {
  const buffer = await generateInvoice({
    username: message.author.username,
    item: 'Premium Plan',
    amount: 499,
    invoiceNo: 'INV-DEMO-001'
  });

  const attachment = new AttachmentBuilder(buffer, { name: 'invoice-preview.png' });
  
  const embed = new EmbedBuilder()
    .setTitle('🧾 Sample Invoice')
    .setColor('#2ecc71')
    .setDescription('This is a preview of how your invoice will look')
    .setImage('attachment://invoice-preview.png');

  const row = new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder()
        .setLabel('Download Invoice')
        .setStyle(ButtonStyle.Link)
        .setURL('attachment://invoice-preview.png')
    );

  await message.reply({ 
    embeds: [embed], 
    files: [attachment],
    components: [row] 
  });
}

// Create invoice with interactive options
async function createInvoice(message, args) {
  const item = args[0];
  const amount = parseFloat(args[1]);

  if (!item || isNaN(amount)) {
    return message.reply('❌ Usage: `invoice create <item> <amount>`');
  }

  const invoiceData = {
    username: message.author.username,
    item: item,
    amount: amount,
    invoiceNo: `INV-${Math.floor(100000 + Math.random() * 900000)}`,
    date: moment().format('YYYY-MM-DD')
  };

  const buffer = await generateInvoice(invoiceData);
  const attachment = new AttachmentBuilder(buffer, { name: `${invoiceData.invoiceNo}.png` });

  const embed = new EmbedBuilder()
    .setTitle('✅ Invoice Generated')
    .setColor('#27ae60')
    .setDescription(`**Invoice #:** ${invoiceData.invoiceNo}`)
    .addFields(
      { name: 'Item', value: invoiceData.item, inline: true },
      { name: 'Amount', value: `₹${invoiceData.amount.toFixed(2)}`, inline: true },
      { name: 'Date', value: invoiceData.date, inline: true }
    )
    .setImage('attachment://' + `${invoiceData.invoiceNo}.png`)
    .setFooter({ text: 'Use the buttons below to manage this invoice' });

  const row = new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder()
        .setCustomId(`invoice_download_${invoiceData.invoiceNo}`)
        .setLabel('Download')
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId(`invoice_share_${invoiceData.invoiceNo}`)
        .setLabel('Share')
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId(`invoice_delete_${invoiceData.invoiceNo}`)
        .setLabel('Delete')
        .setStyle(ButtonStyle.Danger)
    );

  await message.reply({ 
    embeds: [embed], 
    files: [attachment],
    components: [row] 
  });
}

// Show invoice log with dropdown
async function showInvoiceLog(message) {
  // In a real implementation, you would fetch these from a database
  const sampleInvoices = [
    { id: 'INV-123456', item: 'Web Design', amount: 12000, date: '2023-05-15' },
    { id: 'INV-789012', item: 'SEO Service', amount: 8000, date: '2023-06-22' },
    { id: 'INV-345678', item: 'Hosting', amount: 2500, date: '2023-07-10' }
  ];

  const embed = new EmbedBuilder()
    .setTitle('📋 Your Invoice Log')
    .setColor('#9b59b6')
    .setDescription(`You have ${sampleInvoices.length} invoices in your records`)
    .setFooter({ text: 'Select an invoice from the dropdown to view details' });

  const selectMenu = new StringSelectMenuBuilder()
    .setCustomId('invoice_select')
    .setPlaceholder('Select an invoice')
    .addOptions(
      sampleInvoices.map(invoice => ({
        label: invoice.id,
        description: `${invoice.item} - ₹${invoice.amount}`,
        value: invoice.id
      }))
    );

  const row = new ActionRowBuilder()
    .addComponents(selectMenu);

  const actionRow = new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('invoice_refresh_logs')
        .setLabel('Refresh')
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId('invoice_export_logs')
        .setLabel('Export All')
        .setStyle(ButtonStyle.Success)
    );

  await message.reply({ 
    embeds: [embed], 
    components: [row, actionRow] 
  });
}

// Generate invoice image (optimized)
async function generateInvoice({ username, item, amount, invoiceNo }) {
  const canvas = createCanvas(700, 500);
  const ctx = canvas.getContext('2d');

  // Background and styling
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Add gradient header
  const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
  gradient.addColorStop(0, '#3498db');
  gradient.addColorStop(1, '#2ecc71');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, 80);

  // Header text
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 28px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('INVOICE', canvas.width / 2, 50);

  // Reset text alignment
  ctx.textAlign = 'left';

  // Invoice info
  ctx.fillStyle = '#2c3e50';
  ctx.font = '16px sans-serif';
  ctx.fillText(`Invoice #: ${invoiceNo}`, 40, 120);
  ctx.fillText(`Date: ${moment().format('YYYY-MM-DD')}`, 40, 150);
  ctx.fillText(`Billed to: ${username}`, 40, 180);

  // Item table header
  ctx.beginPath();
  ctx.moveTo(40, 210);
  ctx.lineTo(660, 210);
  ctx.strokeStyle = '#7f8c8d';
  ctx.stroke();

  ctx.font = 'bold 18px sans-serif';
  ctx.fillText('Item Description', 50, 240);
  ctx.fillText('Amount (INR)', 520, 240);

  // Item row
  ctx.beginPath();
  ctx.moveTo(40, 260);
  ctx.lineTo(660, 260);
  ctx.stroke();

  ctx.font = '16px sans-serif';
  ctx.fillText(item, 50, 290);
  ctx.fillText(`₹${amount.toFixed(2)}`, 520, 290);

  // Total row
  ctx.beginPath();
  ctx.moveTo(40, 320);
  ctx.lineTo(660, 320);
  ctx.stroke();

  ctx.font = 'bold 18px sans-serif';
  ctx.fillText('Total:', 50, 360);
  ctx.fillText(`₹${amount.toFixed(2)}`, 520, 360);

  // Footer
  ctx.font = 'italic 14px sans-serif';
  ctx.fillStyle = '#7f8c8d';
  ctx.fillText('Thank you for your business!', 250, 420);
  ctx.fillText('Generated via Discord Invoice Bot', 240, 450);

  // Add watermark
  ctx.globalAlpha = 0.1;
  ctx.font = 'bold 60px sans-serif';
  ctx.fillStyle = '#000000';
  ctx.textAlign = 'center';
  ctx.fillText('SAMPLE', canvas.width / 2, canvas.height / 2);
  ctx.globalAlpha = 1;

  return canvas.toBuffer('image/png');
}