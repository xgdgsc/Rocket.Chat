import { Field, TextInput, Chip, Button } from '@rocket.chat/fuselage';
import { useMutableCallback } from '@rocket.chat/fuselage-hooks';
import React, { useState } from 'react';
import { useSubscription } from 'use-subscription';

import { useToastMessageDispatch } from '../../contexts/ToastMessagesContext';
import { useTranslation } from '../../contexts/TranslationContext';
import { AsyncStatePhase } from '../../hooks/useAsyncState';
import { useEndpointData } from '../../hooks/useEndpointData';
import { formsSubscription } from '../../views/omnichannel/additionalForms';
import { FormSkeleton } from './Skeleton';

const Tags = ({ tags = [], handler = () => {} }) => {
	const { value: tagsResult = [], phase: stateTags } = useEndpointData('livechat/tags.list');
	const t = useTranslation();
	const forms = useSubscription(formsSubscription);

	const { useCurrentChatTags = () => {} } = forms;
	const TagsEE = useCurrentChatTags();

	const dispatchToastMessage = useToastMessageDispatch();

	const [tagValue, handleTagValue] = useState('');

	const removeTag = (tag) => {
		const tagsFiltered = tags.filter((tagArray) => tagArray !== tag);
		handler(tagsFiltered);
	};

	const handleTagTextSubmit = useMutableCallback(() => {
		if (tags.includes(tagValue)) {
			dispatchToastMessage({ type: 'error', message: t('Tag_already_exists') });
			return;
		}
		if (tagValue && tagValue.trim() === '') {
			dispatchToastMessage({ type: 'error', message: t('Enter_a_tag') });
			handleTagValue('');
			return;
		}
		handler([...tags, tagValue]);
		handleTagValue('');
	});

	if ([stateTags].includes(AsyncStatePhase.LOADING)) {
		return <FormSkeleton />;
	}

	const { tags: tagsList } = tagsResult;

	return (
		<>
			<Field.Label mb='x4'>{t('Tags')}</Field.Label>
			{TagsEE && tagsList && tagsList.length > 0 ? (
				<Field.Row>
					<TagsEE value={tags} handler={handler} />
				</Field.Row>
			) : (
				<>
					<Field.Row>
						<TextInput
							value={tagValue}
							onChange={(event) => handleTagValue(event.target.value)}
							flexGrow={1}
							placeholder={t('Enter_a_tag')}
						/>
						<Button mis='x8' title={t('add')} onClick={handleTagTextSubmit}>
							{t('Add')}
						</Button>
					</Field.Row>
					<Field.Row justifyContent='flex-start'>
						{tags.map((tag, i) => (
							<Chip key={i} onClick={() => removeTag(tag)} mie='x8'>
								{tag}
							</Chip>
						))}
					</Field.Row>
				</>
			)}
		</>
	);
};

export default Tags;
