/**
 * @copyright Copyright (c) 2024 Louis Chmn <louis@chmn.me>
 *
 * @author Louis Chmn <louis@chmn.me>
 *
 * @license AGPL-3.0-or-later
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 *
 */

import type { User } from '@nextcloud/cypress'
import { copyFile, getRowForFile, moveFile, triggerActionForFile } from './FilesUtils'

describe('Files: Live photos', { testIsolation: true }, () => {
	let currentUser: User
	let randomFileName: string
	let jpgFileId: string|undefined
	let movFileId: string|undefined

	before(() => {
		cy.createRandomUser().then((user) => {
			currentUser = user
			randomFileName = Math.random().toString(36).replace(/[^a-z]+/g, '').substring(0, 10)

			cy.uploadContent(currentUser, new Blob(['jpg file'], { type: 'image/jpg' }), 'image/jpg', `/${randomFileName}.jpg`)
			cy.uploadContent(currentUser, new Blob(['mov file'], { type: 'video/mov' }), 'video/mov', `/${randomFileName}.mov`)

			// Get the file IDs
			cy.login(currentUser)
			cy.visit('/apps/files')
			getRowForFile(`${randomFileName}.jpg`).invoke('attr', 'data-cy-files-list-row-fileid').then(fileId => { jpgFileId = fileId })
			getRowForFile(`${randomFileName}.mov`).invoke('attr', 'data-cy-files-list-row-fileid').then(fileId => { movFileId = fileId })

			let hostname: string
			cy.url().then(url => { hostname = new URL(url).hostname })

			// PROPPATCH both files to update their live photo metadata
			;[['mov', jpgFileId], ['jpg', movFileId]].forEach(([ext, fileId]) => {
				cy.then(() => {
					cy.logout()
					cy.request({
						method: 'PROPPATCH',
						url: `http://${hostname}/remote.php/dav/files/${currentUser.userId}/${randomFileName}.${ext}`,
						auth: { user: currentUser.userId, pass: currentUser.password },
						body: `<?xml version="1.0"?>
							<d:propertyupdate xmlns:d="DAV:" xmlns:nc="http://nextcloud.org/ns">
								<d:set>
									<d:prop>
										<nc:metadata-files-live-photo>${fileId}</nc:metadata-files-live-photo>
									</d:prop>
								</d:set>
							</d:propertyupdate>`,
					})
				})
			})
		})
	})

	beforeEach(() => {
		cy.login(currentUser)
		cy.visit('/apps/files')
	})

	it('Only renders the .jpg file', () => {
		cy.get(`[data-cy-files-list-row-fileid="${jpgFileId}"]`).should('have.length', 1)
		cy.get(`[data-cy-files-list-row-fileid="${movFileId}"]`).should('have.length', 0)
	})

	context("'Show hidden files' is enabled", () => {
		before(() => {
			cy.login(currentUser)
			cy.visit('/apps/files')
			cy.get('[data-cy-files-navigation-settings-button]').click()
			// Force:true because the checkbox is hidden by the pretty UI.
			cy.get('[data-cy-files-settings-setting="show_hidden"] input').check({ force: true })
		})

		it("Shows both files when 'Show hidden files' is enabled", () => {
			cy.get(`[data-cy-files-list-row-fileid="${jpgFileId}"]`).should('have.length', 1)
			cy.get(`[data-cy-files-list-row-fileid="${movFileId}"]`).should('have.length', 1)
		})

		it('Copies both files when copying the .jpg', () => {
			copyFile(`${randomFileName}.jpg`, '.')
			cy.visit('/apps/files')

			cy.get(`[data-cy-files-list-row-fileid="${jpgFileId}"]`).invoke('attr', 'data-cy-files-list-row-name').should('equal', `${randomFileName}.jpg`)
			cy.get(`[data-cy-files-list-row-fileid="${movFileId}"]`).invoke('attr', 'data-cy-files-list-row-name').should('equal', `${randomFileName}.mov`)
			cy.get(`[data-cy-files-list-row-name="${randomFileName} (copy).jpg"]`).should('have.length', 1)
			cy.get(`[data-cy-files-list-row-name="${randomFileName} (copy).mov"]`).should('have.length', 1)

			triggerActionForFile(`${randomFileName} (copy).jpg`, 'delete')
		})

		it('Blocks copy both files when copying the .mov', () => {
			copyFile(`${randomFileName}.mov`, '.')
			cy.visit('/apps/files')

			cy.get(`[data-cy-files-list-row-fileid="${jpgFileId}"]`).invoke('attr', 'data-cy-files-list-row-name').should('equal', `${randomFileName}.jpg`)
			cy.get(`[data-cy-files-list-row-fileid="${movFileId}"]`).invoke('attr', 'data-cy-files-list-row-name').should('equal', `${randomFileName}.mov`)
			cy.get(`[data-cy-files-list-row-name="${randomFileName} (copy).jpg"]`).should('have.length', 0)
			cy.get(`[data-cy-files-list-row-name="${randomFileName} (copy).mov"]`).should('have.length', 0)
		})

		it('Moves files when moving the .jpg', () => {
			moveFile(`${randomFileName}.mov`, `${randomFileName}_moved.mov`)
			cy.visit('/apps/files')

			cy.get(`[data-cy-files-list-row-fileid="${jpgFileId}"]`).invoke('attr', 'data-cy-files-list-row-name').should('equal', `${randomFileName}_moved.jpg`)
			cy.get(`[data-cy-files-list-row-fileid="${movFileId}"]`).invoke('attr', 'data-cy-files-list-row-name').should('equal', `${randomFileName}_moved.mov`)

			moveFile(`${randomFileName}_copie.mov`, `${randomFileName}.mov`)
		})

		it('Blocks moving files when moving the .mov', () => {
			moveFile(`${randomFileName}.mov`, `${randomFileName}_moved.mov`)
			cy.visit('/apps/files')

			cy.get(`[data-cy-files-list-row-fileid="${jpgFileId}"]`).invoke('attr', 'data-cy-files-list-row-name').should('equal', `${randomFileName}.jpg`)
			cy.get(`[data-cy-files-list-row-fileid="${movFileId}"]`).invoke('attr', 'data-cy-files-list-row-name').should('equal', `${randomFileName}.mov`)
		})

		it('Deletes files when deleting the .jpg', () => {
			copyFile(`${randomFileName}.jpg`, '.')
			cy.visit('/apps/files')
			triggerActionForFile(`${randomFileName} (copy).jpg`, 'delete')
			cy.visit('/apps/files')

			cy.get(`[data-cy-files-list-row-fileid="${jpgFileId}"]`).invoke('attr', 'data-cy-files-list-row-name').should('equal', `${randomFileName}.jpg`)
			cy.get(`[data-cy-files-list-row-fileid="${movFileId}"]`).invoke('attr', 'data-cy-files-list-row-name').should('equal', `${randomFileName}.mov`)
			cy.get(`[data-cy-files-list-row-name="${randomFileName} (copy).jpg"]`).should('have.length', 0)
			cy.get(`[data-cy-files-list-row-name="${randomFileName} (copy).mov"]`).should('have.length', 0)
		})

		it('Blocks deleting files when moving the .mov', () => {
			copyFile(`${randomFileName}.jpg`, '.')
			cy.visit('/apps/files')
			triggerActionForFile(`${randomFileName} (copy).mov`, 'delete')
			cy.visit('/apps/files')

			cy.get(`[data-cy-files-list-row-fileid="${jpgFileId}"]`).invoke('attr', 'data-cy-files-list-row-name').should('equal', `${randomFileName}.jpg`)
			cy.get(`[data-cy-files-list-row-fileid="${movFileId}"]`).invoke('attr', 'data-cy-files-list-row-name').should('equal', `${randomFileName}.mov`)
			cy.get(`[data-cy-files-list-row-name="${randomFileName} (copy).jpg"]`).should('have.length', 1)
			cy.get(`[data-cy-files-list-row-name="${randomFileName} (copy).mov"]`).should('have.length', 1)

			triggerActionForFile(`${randomFileName} (copy).jpg`, 'delete')
		})

		it('Restores files when restoring the .jpg', () => {

		})

		it('Blocks restoring files when restoring the .mov', () => {

		})
	})
})
