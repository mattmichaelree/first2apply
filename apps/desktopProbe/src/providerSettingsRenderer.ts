import './providerSettings.css';
import type { ProviderCredentialOverview } from './server/providerCredentials';

type ProviderCredentialResponse = { data?: ProviderCredentialOverview; error?: string };

declare global {
  interface Window {
    providerCredentials: {
      list(): Promise<ProviderCredentialResponse>;
      save(providerId: string, values: Record<string, string>): Promise<ProviderCredentialResponse>;
      remove(providerId: string): Promise<ProviderCredentialResponse>;
    };
  }
}

const root = document.querySelector<HTMLElement>('#provider-settings-app');
if (!root) throw new Error('Provider settings root is missing.');

function element<K extends keyof HTMLElementTagNameMap>(tag: K, className?: string) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  return node;
}

function paragraph(text: string, className?: string) {
  const node = element('p', className);
  node.textContent = text;
  return node;
}

async function unwrap(operation: Promise<ProviderCredentialResponse>) {
  const response = await operation;
  if (response.error || !response.data) throw new Error(response.error || 'Provider credential operation failed.');
  return response.data;
}

function render(overview: ProviderCredentialOverview, notice?: string) {
  root.replaceChildren();

  const header = element('header', 'page-header');
  const eyebrow = paragraph('CareerOS Desktop', 'eyebrow');
  const title = element('h1');
  title.textContent = 'Local provider credentials';
  header.append(
    eyebrow,
    title,
    paragraph(
      'Credentials are encrypted by your operating system and supplied only to the local CareerOS process on its next start.',
      'lede',
    ),
  );
  root.append(header);

  const storageNotice = element('section', overview.storageAvailable ? 'storage-notice' : 'storage-notice error');
  storageNotice.append(paragraph(overview.storageMessage));
  storageNotice.append(
    paragraph(
      'Saving does not contact a provider. After restarting local CareerOS, use the existing Validate action in the Providers workspace. Hosted credentials remain deployment secrets.',
      'secondary',
    ),
  );
  root.append(storageNotice);

  if (notice) root.append(paragraph(notice, 'flash'));

  const grid = element('div', 'provider-grid');
  for (const provider of overview.providers) {
    const card = element('section', 'provider-card');
    const cardHeader = element('div', 'provider-header');
    const heading = element('div');
    const name = element('h2');
    name.textContent = provider.label;
    heading.append(name, paragraph(provider.description, 'secondary'));
    const status = element('span', provider.configured ? 'status configured' : 'status');
    status.textContent = provider.statusText;
    cardHeader.append(heading, status);
    card.append(cardHeader);

    const form = element('form', 'credential-form');
    for (const field of provider.fields) {
      const label = element('label');
      const labelText = element('span');
      labelText.textContent = field.label;
      const input = element('input');
      input.name = field.id;
      input.type = field.inputType;
      input.autocomplete = 'new-password';
      input.disabled = !overview.storageAvailable;
      input.placeholder = field.configured
        ? 'Leave blank to keep the saved value'
        : `Enter ${field.label.toLowerCase()}`;
      const fieldStatus = element('small');
      fieldStatus.textContent = field.displayValue;
      label.append(labelText, input, fieldStatus);
      form.append(label);
    }

    const actions = element('div', 'actions');
    const saveButton = element('button', 'primary');
    saveButton.type = 'submit';
    saveButton.disabled = !overview.storageAvailable;
    saveButton.textContent = provider.configured ? 'Update securely' : 'Save securely';
    actions.append(saveButton);

    if (provider.canRemove) {
      const removeButton = element('button', 'danger');
      removeButton.type = 'button';
      removeButton.textContent = 'Remove';
      removeButton.addEventListener('click', async () => {
        removeButton.disabled = true;
        try {
          render(
            await unwrap(window.providerCredentials.remove(provider.id)),
            `${provider.label} credentials removed.`,
          );
        } catch (error) {
          render(overview, error instanceof Error ? error.message : 'Removal failed.');
        }
      });
      actions.append(removeButton);
    }
    form.append(actions);

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      saveButton.disabled = true;
      const values = Object.fromEntries(new FormData(form).entries()) as Record<string, string>;
      try {
        const updated = await unwrap(window.providerCredentials.save(provider.id, values));
        form.reset();
        render(updated, `${provider.label} credentials saved. Restart local CareerOS to apply them.`);
      } catch (error) {
        form.reset();
        render(overview, error instanceof Error ? error.message : 'Save failed.');
      }
    });

    card.append(form);
    grid.append(card);
  }
  root.append(grid);
}

void unwrap(window.providerCredentials.list())
  .then((overview) => render(overview))
  .catch((error) => {
    root.replaceChildren();
    root.append(
      paragraph(error instanceof Error ? error.message : 'Local provider settings could not be loaded.', 'fatal'),
    );
  });
